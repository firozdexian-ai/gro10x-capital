-- ==============================================================================
-- GRO10X CAPITAL — SUPABASE MIGRATION v1.1.0 (CONCURRENCY & DATA HARDENING)
-- Idempotent & Safe Execution: Run in Supabase SQL Editor
-- Focus: Composite B-Tree Indexes, Atomic RPC Transaction Locks, Notification Queue
-- ==============================================================================

-- ==============================================================================
-- 1. HIGH-PERFORMANCE COMPOSITE DATABASE INDEXES
-- Eliminates full table scans across high-frequency join and filter routes
-- ==============================================================================

-- 1.1 Funding Projects: Discovery Desk & Showcase filters (status + show_on_showcase)
CREATE INDEX IF NOT EXISTS idx_funding_projects_status_showcase 
  ON public.funding_projects (status, show_on_showcase);

-- 1.2 Investment Bookings: Investor Portfolio & Admin Clearance (investor_id + status)
CREATE INDEX IF NOT EXISTS idx_investment_bookings_inv_status 
  ON public.investment_bookings (investor_id, status);

CREATE INDEX IF NOT EXISTS idx_investment_bookings_proj_status 
  ON public.investment_bookings (project_id, status);

-- 1.3 Secondary Market Orders: Live Orderbook & Realtime feed (status + created_at)
CREATE INDEX IF NOT EXISTS idx_secondary_orders_status_created 
  ON public.secondary_orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_secondary_orders_seller_status 
  ON public.secondary_orders (seller_investor_id, status);

-- 1.4 Investor Yields: Historical Payout Ledger drilldown (investor_id + created_at)
CREATE INDEX IF NOT EXISTS idx_investor_yields_inv_created 
  ON public.investor_yields (investor_id, created_at DESC);

-- 1.5 POS Daily Sales: Daily Revenue Audits & Anomaly checks (business_id + date)
CREATE INDEX IF NOT EXISTS idx_pos_daily_sales_biz_date 
  ON public.pos_daily_sales (business_id, date DESC);

-- 1.6 Cash Concierge Tickets: HNW Queue & VIP ticket tracking (status + created_at)
CREATE INDEX IF NOT EXISTS idx_cash_tickets_status_created 
  ON public.cash_tickets (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cash_tickets_kam_status 
  ON public.cash_tickets (kam_id, status);


-- ==============================================================================
-- 2. ASYNCHRONOUS NOTIFICATION QUEUE TABLE
-- Decouples user-facing requests from blocking external Telegram webhook calls
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    channel TEXT NOT NULL DEFAULT 'telegram', -- 'telegram', 'email', 'sms'
    target_bot TEXT NOT NULL DEFAULT 'investor', -- 'investor', 'team', 'client'
    chat_id TEXT,
    recipient_user_id UUID,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    last_error TEXT,
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status_created 
  ON public.notification_queue (status, created_at ASC);


-- ==============================================================================
-- 3. ATOMIC RPC TRANSACTION FUNCTIONS
-- ==============================================================================

-- 3.1 rpc_acquire_secondary_share
-- Concurrency lock: Acquires secondary order and creates linked booking in an atomic transaction.
-- Enforces row lock (FOR UPDATE) to guarantee zero double-allocation.
CREATE OR REPLACE FUNCTION public.rpc_acquire_secondary_share(
    p_order_id UUID,
    p_buyer_investor_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_project_id UUID;
    v_booking_id UUID;
BEGIN
    -- 1. Acquire row-level lock on the target order
    SELECT * INTO v_order 
    FROM public.secondary_orders 
    WHERE id = p_order_id AND status = 'Active' 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'This listing is no longer available or is already locked by another buyer.'
        );
    END IF;

    -- Prevent self-purchase
    IF v_order.seller_investor_id = p_buyer_investor_id THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'You cannot purchase your own secondary market listing.'
        );
    END IF;

    -- 2. Lookup funding_project_id from the original investment
    SELECT funding_project_id INTO v_project_id 
    FROM public.investments 
    WHERE id = v_order.investment_id;

    -- 3. Insert linked investment booking atomically
    INSERT INTO public.investment_bookings (
        investor_id,
        project_id,
        amount_bdt,
        yield_option,
        booking_type,
        status
    ) VALUES (
        p_buyer_investor_id,
        v_project_id,
        v_order.seller_price_bdt,
        1,
        'Secondary',
        'Pending_Proof'
    ) RETURNING id INTO v_booking_id;

    -- 4. Transition order status to Pending_Clearance
    UPDATE public.secondary_orders 
    SET 
        status = 'Pending_Clearance', 
        buyer_booking_id = v_booking_id,
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true, 
        'order_id', p_order_id,
        'booking_id', v_booking_id,
        'amount_bdt', v_order.seller_price_bdt
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3.2 rpc_clear_secondary_transfer
-- Director settlement lock: Clears secondary share transfer, transfers holding ownership,
-- and updates booking status in a single atomic transaction.
CREATE OR REPLACE FUNCTION public.rpc_clear_secondary_transfer(
    p_order_id UUID,
    p_approve BOOLEAN
) RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_buyer_investor_id UUID;
BEGIN
    -- 1. Acquire lock on secondary order
    SELECT * INTO v_order 
    FROM public.secondary_orders 
    WHERE id = p_order_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Secondary order not found.');
    END IF;

    IF v_order.status != 'Pending_Clearance' THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Order is not in Pending_Clearance status (current: ' || v_order.status || ').'
        );
    END IF;

    -- If Director Rejects the clearance: Revert order back to Active, cancel buyer booking
    IF p_approve IS NOT TRUE THEN
        UPDATE public.secondary_orders 
        SET status = 'Active', buyer_booking_id = NULL, updated_at = NOW()
        WHERE id = p_order_id;

        IF v_order.buyer_booking_id IS NOT NULL THEN
            UPDATE public.investment_bookings 
            SET status = 'Cancelled' 
            WHERE id = v_order.buyer_booking_id;
        END IF;

        RETURN jsonb_build_object('success', true, 'status', 'Reverted_To_Active');
    END IF;

    -- If Director Approves:
    -- 2. Resolve buyer investor ID from the linked booking
    SELECT investor_id INTO v_buyer_investor_id 
    FROM public.investment_bookings 
    WHERE id = v_order.buyer_booking_id;

    IF v_buyer_investor_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'No linked buyer booking found for this secondary order.'
        );
    END IF;

    -- 3. Lock & Transfer holding ownership in public.investments
    UPDATE public.investments 
    SET investor_id = v_buyer_investor_id 
    WHERE id = v_order.investment_id;

    -- 4. Mark secondary order as Transferred
    UPDATE public.secondary_orders 
    SET status = 'Transferred', updated_at = NOW()
    WHERE id = p_order_id;

    -- 5. Mark buyer booking as Approved
    UPDATE public.investment_bookings 
    SET status = 'Approved' 
    WHERE id = v_order.buyer_booking_id;

    RETURN jsonb_build_object(
        'success', true, 
        'status', 'Transferred',
        'investment_id', v_order.investment_id,
        'new_owner_investor_id', v_buyer_investor_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
