'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeSubscription } from './useRealtimeSubscription';

/**
 * useRealtimeOrderbook
 * Real-time live secondary market orderbook.
 * Subscribes to public.secondary_orders and provides atomic order acquisition locking.
 *
 * @param {Object} [options]
 * @param {string} [options.filterStatus='Active'] - Default filter status
 * @returns {{
 *   orders: Array,
 *   loading: boolean,
 *   error: string|null,
 *   isRealtimeActive: boolean,
 *   refreshOrderbook: () => Promise<void>,
 *   acquireOrderAtomic: (orderId: string, bookingPayload: Object) => Promise<{ success: boolean, booking?: Object, error?: string }>
 * }}
 */
export function useRealtimeOrderbook({ filterStatus = 'Active' } = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: qErr } = await supabase
        .from('secondary_orders')
        .select(`
          *,
          investments (
            id,
            funding_project_id,
            amount_invested_bdt,
            funding_projects (
              id,
              project_title,
              target_raise_bdt,
              amount_raised_bdt,
              yield_model,
              businesses ( brand_name, industry_sector )
            )
          ),
          seller:seller_investor_id (
            id,
            alias_name,
            requires_anonymity
          )
        `)
        .order('created_at', { ascending: false });

      if (qErr) throw qErr;

      if (isMountedRef.current) {
        setOrders(data || []);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.warn('[useRealtimeOrderbook] Error fetching orderbook:', err);
        setError(err.message || 'Failed to load secondary orders');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchOrders();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchOrders]);

  // Realtime subscription handler for secondary_orders changes
  const handleRealtimeChange = useCallback(async (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      // Fetch the full joined record for the newly listed order
      try {
        const { data: fullNewOrder } = await supabase
          .from('secondary_orders')
          .select(`
            *,
            investments (
              id,
              funding_project_id,
              amount_invested_bdt,
              funding_projects (
                id,
                project_title,
                target_raise_bdt,
                amount_raised_bdt,
                yield_model,
                businesses ( brand_name, industry_sector )
              )
            ),
            seller:seller_investor_id (
              id,
              alias_name,
              requires_anonymity
            )
          `)
          .eq('id', newRecord.id)
          .single();

        if (fullNewOrder && isMountedRef.current) {
          setOrders((prev) => [fullNewOrder, ...prev.filter((o) => o.id !== fullNewOrder.id)]);
        }
      } catch (err) {
        console.warn('[useRealtimeOrderbook] Failed to hydrate new order:', err);
      }
    } else if (eventType === 'UPDATE') {
      if (isMountedRef.current) {
        setOrders((prev) =>
          prev.map((order) => {
            if (order.id === newRecord.id) {
              return { ...order, ...newRecord };
            }
            return order;
          })
        );
      }
    } else if (eventType === 'DELETE') {
      if (isMountedRef.current) {
        setOrders((prev) => prev.filter((order) => order.id !== oldRecord.id));
      }
    }
  }, []);

  const { isSubscribed } = useRealtimeSubscription({
    table: 'secondary_orders',
    event: '*',
    onEvent: handleRealtimeChange,
  });

  /**
   * acquireOrderAtomic
   * Concurrency-safe, atomic acquisition of a secondary order.
   * Enforces status === 'Active' condition to prevent race conditions between simultaneous buyers.
   */
  const acquireOrderAtomic = useCallback(async (orderId, { buyerInvestorId, projectId, amountBdt }) => {
    try {
      // 1. Create the pending secondary investment booking
      const { data: newBooking, error: bookingErr } = await supabase
        .from('investment_bookings')
        .insert([{
          investor_id: buyerInvestorId,
          project_id: projectId,
          amount_bdt: amountBdt,
          yield_option: 1,
          booking_type: 'Secondary',
          status: 'Pending_Proof'
        }])
        .select()
        .single();

      if (bookingErr) throw bookingErr;

      // 2. Atomic conditional update: lock order only if still 'Active'
      const { data: updatedOrder, error: orderErr } = await supabase
        .from('secondary_orders')
        .update({
          status: 'Pending_Clearance',
          buyer_booking_id: newBooking.id
        })
        .eq('id', orderId)
        .eq('status', 'Active') // Concurrency safeguard
        .select()
        .single();

      if (orderErr || !updatedOrder) {
        // Rollback booking if order was already acquired by another buyer
        await supabase.from('investment_bookings').delete().eq('id', newBooking.id);
        throw new Error('This listing was already matched or acquired by another investor.');
      }

      // Optimistic local state update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'Pending_Clearance', buyer_booking_id: newBooking.id } : o))
      );

      return { success: true, booking: newBooking };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to acquire order' };
    }
  }, []);

  const activeOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter((o) => o.status === filterStatus);

  return {
    orders: activeOrders,
    rawOrders: orders,
    loading,
    error,
    isRealtimeActive: isSubscribed,
    refreshOrderbook: fetchOrders,
    acquireOrderAtomic,
  };
}
