"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";
import { setToken } from "@/lib/auth";

export function LoginForm() {
  const [email, setEmail] = useState("admin@ironsaas.local");
  const [password, setPassword] = useState("admin123");
  const [status, setStatus] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Entrando...");
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setStatus("Falha no login");
      return;
    }
    const data = await res.json();
    setToken(data.access_token);
    setStatus("Login realizado. Recarregue a página.");
  }

  return (
    <form onSubmit={handleLogin} style={{ display: "grid", gap: 12, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: 20, maxWidth: 420 }}>
      <h2 style={{ margin: 0 }}>Login de demonstração</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ padding: 12, borderRadius: 12, border: "1px solid #d0d5dd" }} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" style={{ padding: 12, borderRadius: 12, border: "1px solid #d0d5dd" }} />
      <button type="submit" style={{ background: "#0f172a", color: "#fff", border: 0, borderRadius: 12, padding: "14px 18px", fontWeight: 700 }}>Entrar</button>
      {status ? <div style={{ color: "#475467", fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
