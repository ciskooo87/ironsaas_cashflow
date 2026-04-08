"use client";

import { getToken } from '@/lib/auth';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/cashflow-api';

async function parseResponse(res: Response) {
  if (!res.ok) throw new Error(`api_error_${res.status}`);
  return res.json();
}

export async function apiGet(path: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return parseResponse(res);
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
  return parseResponse(res);
}

export async function apiPut(path: string, body: any) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}
