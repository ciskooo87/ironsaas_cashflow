"use client";

import { clearToken, getToken } from '@/lib/auth';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/cashflow-api';
const USER_KEY = 'ironsaas_cashflow_user';

function clearLocalSession() {
  clearToken();
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(USER_KEY);
  }
}

async function parseResponse(res: Response) {
  if (res.status === 401) {
    clearLocalSession();
    throw new Error('session_expired');
  }

  if (!res.ok) {
    let detail = '';
    try {
      const data = await res.json();
      detail = data?.detail ? String(data.detail) : '';
    } catch {
      detail = '';
    }
    throw new Error(detail ? `api_error_${res.status}:${detail}` : `api_error_${res.status}`);
  }
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

export async function apiDelete(path: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return parseResponse(res);
}
