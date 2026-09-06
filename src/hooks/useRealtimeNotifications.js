'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeSubscription } from './useRealtimeSubscription';

/**
 * useRealtimeNotifications
 * Manages in-app notifications with real-time updates for:
 * - Direct user notifications (user_id = auth.uid())
 * - System-wide broadcast alerts (user_id IS NULL)
 *
 * @param {string|null} userId - The Supabase auth user UUID
 * @returns {{
 *   notifications: Array,
 *   unreadCount: number,
 *   loading: boolean,
 *   markAsRead: (id: string) => Promise<void>,
 *   markAllAsRead: () => Promise<void>,
 *   refreshNotifications: () => Promise<void>
 * }}
 */
export function useRealtimeNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      if (isMountedRef.current) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      if (isMountedRef.current) {
        const notifs = data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.warn('[useRealtimeNotifications] Failed to load notifications:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchNotifications();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchNotifications]);

  // Handle Realtime incoming notification
  const handleRealtimeChange = useCallback(
    (payload) => {
      const { eventType, new: newNotif } = payload;

      if (eventType === 'INSERT' && newNotif) {
        // Only process if direct to this user or a broadcast
        if (newNotif.user_id === userId || newNotif.user_id === null) {
          if (isMountedRef.current) {
            setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
            if (!newNotif.is_read) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        }
      } else if (eventType === 'UPDATE' && newNotif) {
        if (isMountedRef.current) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === newNotif.id ? { ...n, ...newNotif } : n))
          );
        }
      }
    },
    [userId]
  );

  useRealtimeSubscription({
    table: 'notifications',
    event: '*',
    onEvent: handleRealtimeChange,
    enabled: Boolean(userId),
  });

  const markAsRead = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      if (isMountedRef.current) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn('[useRealtimeNotifications] Failed to mark as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('is_read', false);

      if (error) throw error;

      if (isMountedRef.current) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.warn('[useRealtimeNotifications] Failed to mark all as read:', err);
    }
  }, [userId, unreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
}
