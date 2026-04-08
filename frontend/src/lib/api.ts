"use client";

import { getToken } from '@/lib/auth';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8018/api';

export async function apiGet(path: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`api_error_${res.status}`);
  return res.json();
}

export async function apiPost(path: string, body: any) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`api_error_${res.status}`);
  return res.json();
}
