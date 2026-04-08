export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8018/api';

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`api_error_${res.status}`);
  return res.json();
}
