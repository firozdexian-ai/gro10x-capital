'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  role: null,
  loading: true,
  roleError: null,
  signOut: async () => {},
  refreshRole: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin', 'investor', 'kam', 'promoter', 'founder'
  const [loading, setLoading] = useState(true);
  const [roleError, setRoleError] = useState(null);
  const isMountedRef = useRef(true);
  const activeFetchUserIdRef = useRef(null);

  const fetchUserRole = useCallback(async (userId) => {
    if (!userId) {
      if (isMountedRef.current) {
        setRole(null);
        setLoading(false);
      }
      return null;
    }

    activeFetchUserIdRef.current = userId;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!isMountedRef.current || activeFetchUserIdRef.current !== userId) {
        return null;
      }

      if (error) {
        console.warn('Could not fetch user role, defaulting to investor:', error.message);
        setRoleError(error.message);
        setRole('investor');
        return 'investor';
      }

      const assignedRole = data?.role || 'investor';
      setRole(assignedRole);
      setRoleError(null);
      return assignedRole;
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Error fetching role:', err);
        setRoleError(err?.message || 'Unknown error');
        setRole('investor');
      }
      return 'investor';
    } finally {
      if (isMountedRef.current && activeFetchUserIdRef.current === userId) {
        setLoading(false);
      }
    }
  }, []);

  const refreshRole = useCallback(async () => {
    if (user?.id) {
      setLoading(true);
      return await fetchUserRole(user.id);
    }
    return null;
  }, [user?.id, fetchUserRole]);

  useEffect(() => {
    isMountedRef.current = true;
    let authSubscription = null;

    // Check active session on initial load
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session retrieval warning:', error.message);
        }

        if (isMountedRef.current) {
          if (session?.user) {
            setUser(session.user);
            await fetchUserRole(session.user.id);
          } else {
            setUser(null);
            setRole(null);
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          console.error('Auth initialization error:', err);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    authSubscription = data?.subscription;

    return () => {
      isMountedRef.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchUserRole]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      if (isMountedRef.current) {
        setUser(null);
        setRole(null);
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, roleError, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
