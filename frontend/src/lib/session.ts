"use client";

import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

export const USER_KEY = 'ironsaas_cashflow_user';

type SessionUser = {
  id: number;
  company_id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

export function getStoredUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: SessionUser) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(USER_KEY);
}

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const cached = getStoredUser();
    if (cached) {
      setUser(cached);
      setLoading(false);
      return cached;
    }

    try {
      const me = await apiGet('/auth/me');
      setStoredUser(me);
      setUser(me);
      return me as SessionUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return { user, companyId: user?.company_id ?? null, loading, refreshUser };
}
