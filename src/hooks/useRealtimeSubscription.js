'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useRealtimeSubscription
 * Reusable, memory-safe hook for subscribing to Supabase Realtime postgres_changes.
 * Automatically manages channel uniqueness, subscription lifecycle, and cleanup on unmount.
 *
 * @param {Object} options
 * @param {string} options.table - The Supabase table name
 * @param {string} [options.filter] - Optional PostgREST filter string (e.g. 'user_id=eq.123')
 * @param {string} [options.schema='public'] - Database schema
 * @param {string} [options.event='*'] - Event type: '*', 'INSERT', 'UPDATE', or 'DELETE'
 * @param {Function} options.onEvent - Callback invoked when a change payload arrives
 * @param {boolean} [options.enabled=true] - Condition to activate/deactivate the subscription
 * @returns {{ isSubscribed: boolean, status: string }}
 */
export function useRealtimeSubscription({
  table,
  filter,
  schema = 'public',
  event = '*',
  onEvent,
  enabled = true,
}) {
  const [status, setStatus] = useState('DISCONNECTED');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled || !table) {
      setStatus('DISABLED');
      setIsSubscribed(false);
      return;
    }

    const channelId = `realtime:${schema}:${table}:${filter || 'all'}:${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const channelConfig = {
      event,
      schema,
      table,
    };
    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', channelConfig, (payload) => {
        if (typeof onEventRef.current === 'function') {
          onEventRef.current(payload);
        }
      })
      .subscribe((subscribeStatus, err) => {
        setStatus(subscribeStatus);
        setIsSubscribed(subscribeStatus === 'SUBSCRIBED');
        if (err) {
          console.warn(`[Realtime] Subscription error on ${table}:`, err);
        }
      });

    return () => {
      setIsSubscribed(false);
      setStatus('DISCONNECTED');
      supabase.removeChannel(channel);
    };
  }, [table, filter, schema, event, enabled]);

  return { isSubscribed, status };
}
