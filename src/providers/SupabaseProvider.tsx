'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SupabaseClient, Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient, SupabaseNetworkError } from '@/lib/supabase/client';

export interface SupabaseContextValue {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isOffline: boolean;
  isBrowserOffline: boolean;
  isSupabaseUnreachable: boolean;
  authError: Error | null;
  retryConnection: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowserOffline, setIsBrowserOffline] = useState(false);
  const [isSupabaseUnreachable, setIsSupabaseUnreachable] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Monitor browser network state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsBrowserOffline(false);
    const handleOffline = () => setIsBrowserOffline(true);

    setIsBrowserOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnectionAndSession = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setAuthError(error);
        if (error.message?.includes('Failed to fetch') || error.name === 'SupabaseNetworkError') {
          setIsSupabaseUnreachable(true);
        }
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsSupabaseUnreachable(false);
      }
    } catch (err) {
      if (err instanceof SupabaseNetworkError || (err instanceof Error && err.message?.includes('Failed to fetch'))) {
        setIsSupabaseUnreachable(true);
        setAuthError(err instanceof Error ? err : new Error('Supabase network error'));
      } else {
        setAuthError(err instanceof Error ? err : new Error('Unknown auth initialization error'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const retryConnection = useCallback(async () => {
    if (typeof window !== 'undefined') {
      setIsBrowserOffline(!navigator.onLine);
    }
    await checkConnectionAndSession();
  }, [checkConnectionAndSession]);

  useEffect(() => {
    let isMounted = true;

    // Listen for auth state changes once on mount
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
      setIsSupabaseUnreachable(false);
    });

    // Check initial session
    supabase.auth
      .getSession()
      .then(({ data, error }: { data: { session: Session | null }; error: any }) => {
        if (!isMounted) return;
        if (error) {
          setAuthError(error);
          if (error.message?.includes('Failed to fetch') || error.name === 'SupabaseNetworkError') {
            setIsSupabaseUnreachable(true);
          }
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setIsSupabaseUnreachable(false);
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        if (err instanceof SupabaseNetworkError || (err instanceof Error && err.message?.includes('Failed to fetch'))) {
          setIsSupabaseUnreachable(true);
          setAuthError(err instanceof Error ? err : new Error('Supabase network error'));
        } else {
          setAuthError(err instanceof Error ? err : new Error('Unknown auth initialization error'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const isOffline = isBrowserOffline || isSupabaseUnreachable;

  const value = React.useMemo<SupabaseContextValue>(
    () => ({
      supabase,
      session,
      user,
      isLoading,
      isOffline,
      isBrowserOffline,
      isSupabaseUnreachable,
      authError,
      retryConnection,
    }),
    [
      supabase,
      session,
      user,
      isLoading,
      isOffline,
      isBrowserOffline,
      isSupabaseUnreachable,
      authError,
      retryConnection,
    ]
  );

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase(): SupabaseContextValue {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}
