"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { setStoredUser } from "@/lib/session";

const fieldStyle = { padding: 14, borderRadius: 14, border: '1px solid #d0d5dd', background: '#fcfcfd', fontSize: 14 } as const;

export function LoginForm() {
  const [email, setEmail] = useState("admin@ironsaas.com");
  const [password, setPassword] = useState("admin123");
  const [status, setStatus] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Entrando...");
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setStatus("Falha no login. Revise as credenciais e tente novamente.");
      return;
    }
    const data = await res.json();
    setToken(data.access_token);

    const meRes = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${data.access_token}` } });
    if (meRes.ok) {
      const me = await meRes.json();
      setStoredUser(me);
    }

    setStatus("Login realizado. Redirecionando...");
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} style={{ display: "grid", gap: 14, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, padding: 28, maxWidth: 460, boxShadow: '0 20px 48px rgba(15,23,42,0.08)' }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800 }}>Acesso</div>
        <h2 style={{ margin: '10px 0 0', fontSize: 28 }}>Login de demonstração</h2>
        <p style={{ margin: '10px 0 0', color: '#667085', lineHeight: 1.7, fontSize: 14 }}>Entre para acessar o app no contexto da empresa e testar o fluxo real do cashflow.</p>
      </div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={fieldStyle} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" style={fieldStyle} />
      <div style={{ display: 'grid', gap: 8, background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 16, padding: 14, color: '#475467', fontSize: 13 }}>
        <div><strong>Email:</strong> admin@ironsaas.com</div>
        <div><strong>Senha:</strong> admin123</div>
      </div>
      <button type="submit" style={{ background: "linear-gradient(135deg, #111827 0%, #1d2939 100%)", color: "#fff", border: 0, borderRadius: 14, padding: "15px 18px", fontWeight: 800, boxShadow: '0 12px 24px rgba(17,24,39,0.18)' }}>Entrar</button>
      {status ? <div style={{ color: "#475467", fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
