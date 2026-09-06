'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeSubscription } from './useRealtimeSubscription';

/**
 * useRealtimeTickets
 * Real-time synchronization of Cash Concierge OTC tickets across:
 * - Investors (/cash-concierge)
 * - KAMs (/kam-dashboard & /team-miniapp)
 * - Admins (/admin)
 *
 * @param {Object} options
 * @param {string} [options.role='all'] - 'investor' | 'kam' | 'admin' | 'all'
 * @param {string} [options.entityId] - The investor ID or KAM ID
 * @returns {{
 *   tickets: Array,
 *   loading: boolean,
 *   error: string|null,
 *   isRealtimeActive: boolean,
 *   refreshTickets: () => Promise<void>,
 *   updateTicketStatus: (ticketId: string, newStatus: string, metadata?: Object) => Promise<{ success: boolean, error?: string }>
 * }}
 */
export function useRealtimeTickets({ role = 'all', entityId = null } = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('cash_tickets')
        .select(`
          *,
          investors (
            id,
            user_id,
            alias_name,
            full_name,
            phone,
            email,
            kyc_level,
            requires_anonymity
          ),
          funding_projects!target_project_id (
            id,
            project_title,
            target_raise_bdt,
            businesses ( brand_name )
          )
        `)
        .order('created_at', { ascending: false });

      if (role === 'investor' && entityId) {
        query = query.eq('investor_id', entityId);
      } else if (role === 'kam' && entityId) {
        query = query.or(`kam_id.eq.${entityId},assigned_kam_id.eq.${entityId}`);
      }

      const { data, error: qErr } = await query;
      if (qErr) throw qErr;

      if (isMountedRef.current) {
        setTickets(data || []);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.warn('[useRealtimeTickets] Error fetching cash tickets:', err);
        setError(err.message || 'Failed to load tickets');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [role, entityId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchTickets();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchTickets]);

  const handleRealtimeChange = useCallback(async (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      try {
        const { data: fullTicket } = await supabase
          .from('cash_tickets')
          .select(`
            *,
            investors (
              id,
              user_id,
              alias_name,
              full_name,
              phone,
              email,
              kyc_level,
              requires_anonymity
            ),
            funding_projects!target_project_id (
              id,
              project_title,
              target_raise_bdt,
              businesses ( brand_name )
            )
          `)
          .eq('id', newRecord.id)
          .single();

        if (fullTicket && isMountedRef.current) {
          // Check role eligibility
          if (role === 'investor' && entityId && fullTicket.investor_id !== entityId) return;
          if (role === 'kam' && entityId && fullTicket.kam_id !== entityId && fullTicket.assigned_kam_id !== entityId) return;

          setTickets((prev) => [fullTicket, ...prev.filter((t) => t.id !== fullTicket.id)]);
        }
      } catch (err) {
        console.warn('[useRealtimeTickets] Failed to hydrate new ticket:', err);
      }
    } else if (eventType === 'UPDATE') {
      if (isMountedRef.current) {
        setTickets((prev) =>
          prev.map((ticket) => {
            if (ticket.id === newRecord.id) {
              return { ...ticket, ...newRecord };
            }
            return ticket;
          })
        );
      }
    } else if (eventType === 'DELETE') {
      if (isMountedRef.current) {
        setTickets((prev) => prev.filter((ticket) => ticket.id !== oldRecord.id));
      }
    }
  }, [role, entityId]);

  const { isSubscribed } = useRealtimeSubscription({
    table: 'cash_tickets',
    event: '*',
    onEvent: handleRealtimeChange,
  });

  const updateTicketStatus = useCallback(async (ticketId, newStatus, metadata = {}) => {
    try {
      const payload = {
        status: newStatus,
        ...metadata,
      };

      const { error: uErr } = await supabase
        .from('cash_tickets')
        .update(payload)
        .eq('id', ticketId);

      if (uErr) throw uErr;

      // Optimistic update
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, ...payload } : t))
      );

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update ticket status' };
    }
  }, []);

  return {
    tickets,
    loading,
    error,
    isRealtimeActive: isSubscribed,
    refreshTickets: fetchTickets,
    updateTicketStatus,
  };
}
