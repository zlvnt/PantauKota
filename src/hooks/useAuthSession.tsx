'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: 'WARGA' | 'ADMIN';
  isActive: boolean;
};

type AuthSession = {
  user: AppUser;
};

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  data: AuthSession | null;
  status: AuthStatus;
  update: () => Promise<AuthSession | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchSession(): Promise<AuthSession | null> {
  const res = await fetch('/api/auth/session', { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const update = useCallback(async () => {
    setStatus('loading');
    const nextSession = await fetchSession();
    setData(nextSession);
    setStatus(nextSession ? 'authenticated' : 'unauthenticated');
    return nextSession;
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    update();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      update();
    });

    return () => subscription.unsubscribe();
  }, [update]);

  const value = useMemo(() => ({ data, status, update }), [data, status, update]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSession harus digunakan di dalam AuthSessionProvider.');
  }
  return context;
}

export async function signOut({ callbackUrl = '/login' }: { callbackUrl?: string } = {}) {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
  window.location.href = callbackUrl;
}
