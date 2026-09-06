'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

/**
 * useStakeholderProfile
 * Resolves and caches the authenticated user's stakeholder profile across all 6 roles:
 * - investor: public.investors (kyc_level, alias_name, phone, telegram_chat_id)
 * - founder: public.founders (linked businesses, brand_name, registration)
 * - kam: public.team / public.kams (assigned territory, portfolio)
 * - promoter: public.team / public.promoters (referral_code, commission tier)
 * - admin: public.team (designation, management access)
 *
 * @returns {{
 *   profile: Object|null,
 *   entityId: string|null,
 *   role: string|null,
 *   user: Object|null,
 *   loading: boolean,
 *   error: string|null,
 *   refreshProfile: () => Promise<Object|null>
 * }}
 */
export function useStakeholderProfile() {
  const { user, role, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      if (isMountedRef.current) {
        setProfile(null);
        setLoading(false);
      }
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      let entityData = null;

      if (role === 'investor' || !role) {
        const { data, error: qErr } = await supabase
          .from('investors')
          .select('*, kyc_submissions(status, target_level)')
          .eq('user_id', user.id)
          .maybeSingle();

        if (qErr && qErr.code !== 'PGRST116') throw qErr;
        entityData = data;
      } else if (role === 'founder') {
        const { data, error: qErr } = await supabase
          .from('founders')
          .select('*, businesses(*, funding_projects(*))')
          .eq('user_id', user.id)
          .maybeSingle();

        if (qErr && qErr.code !== 'PGRST116') throw qErr;
        entityData = data;
      } else if (role === 'kam') {
        // Modern team table lookup with legacy fallback
        const { data: teamData } = await supabase
          .from('team')
          .select('*')
          .eq('user_id', user.id)
          .in('team_type', ['kam', 'manager', 'admin'])
          .maybeSingle();

        if (teamData) {
          entityData = teamData;
        } else {
          const { data: kamData } = await supabase
            .from('kams')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          entityData = kamData;
        }
      } else if (role === 'promoter') {
        // Modern team table lookup with legacy fallback
        const { data: teamData } = await supabase
          .from('team')
          .select('*')
          .eq('user_id', user.id)
          .eq('team_type', 'promoter')
          .maybeSingle();

        if (teamData) {
          entityData = teamData;
        } else {
          const { data: promData } = await supabase
            .from('promoters')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          entityData = promData;
        }
      } else if (role === 'admin' || role === 'manager') {
        const { data: teamData } = await supabase
          .from('team')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        entityData = teamData;
      }

      if (isMountedRef.current) {
        setProfile(entityData);
        return entityData;
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.warn(`[useStakeholderProfile] Failed to fetch ${role} profile:`, err);
        setError(err.message || 'Failed to load profile');
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, role]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!authLoading) {
      fetchProfile();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [authLoading, fetchProfile]);

  return {
    profile,
    entityId: profile?.id || null,
    role,
    user,
    loading: authLoading || loading,
    error,
    refreshProfile: fetchProfile,
  };
}
