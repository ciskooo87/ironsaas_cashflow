"use client";

import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

const fieldStyle = { padding: 14, borderRadius: 14, border: '1px solid #d0d5dd', background: '#fcfcfd', fontSize: 14 } as const;

function humanizeError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';
  if (!message) return fallback;
  if (message === 'session_expired') return 'Sua sessão expirou. Faça login novamente.';
  if (message === 'email_already_exists') return 'Já existe um usuário com este email.';
  if (message === 'user_not_found') return 'Usuário não encontrado.';
  return `Falha: ${message}`;
}

export default function UsuariosPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operacional', is_active: true });

  const loadUsers = useCallback(() => {
    if (!companyId) {
      setUsers([]); setLoading(false); return;
    }
    setLoading(true);
    apiGet(`/companies/${companyId}/users`).then(setUsers).catch(() => setUsers([])).finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    if (editingUser) {
      setForm({ name: editingUser.name || '', email: editingUser.email || '', password: '', role: editingUser.role || 'operacional', is_active: editingUser.is_active });
      setStatusMessage('');
    } else {
      setForm({ name: '', email: '', password: '', role: 'operacional', is_active: true });
    }
  }, [editingUser]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!companyId) {
      setStatusMessage('Faça login para gerenciar usuários.');
      return;
    }
    try {
      if (editingUser) {
        await apiPut(`/users/${editingUser.id}`, {
          name: form.name,
          email: form.email,
          password: form.password || null,
          role: form.role,
          is_active: form.is_active,
        });
        setStatusMessage('Usuário atualizado com sucesso.');
      } else {
        await apiPost('/users', {
          company_id: companyId,
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        setStatusMessage('Usuário criado com sucesso.');
      }
      setEditingUser(null);
      setForm({ name: '', email: '', password: '', role: 'operacional', is_active: true });
      loadUsers();
    } catch (error) {
      setStatusMessage(humanizeError(error, editingUser ? 'Falha ao atualizar usuário.' : 'Falha ao criar usuário.'));
    }
  }

  return (
    <AppShell title="Usuários" subtitle="Cadastro de usuários com trilha de auditoria sobre quem criou e quem alterou cada registro.">
      {statusMessage ? <div style={{ marginBottom: 16, background: '#fff', border: '1px solid #d0d5dd', borderRadius: 16, padding: 16, color: '#475467' }}>{statusMessage}</div> : null}
      {sessionLoading || loading ? <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, color: '#475467' }}>Carregando usuários...</div> : !companyId ? <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24 }}>Faça login para carregar os usuários.</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            {users.length ? users.map((user: any) => (
              <div key={user.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 24 }}>{user.name}</div>
                    <div style={{ marginTop: 8, color: '#667085' }}>{user.email}</div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ background: '#eff4ff', color: '#004EEB', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 800 }}>{user.role}</span>
                      <span style={{ background: user.is_active ? '#ecfdf3' : '#fef3f2', color: user.is_active ? '#027A48' : '#B42318', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 800 }}>{user.is_active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                    <div style={{ marginTop: 14, display: 'grid', gap: 6, color: '#475467', fontSize: 14 }}>
                      <div><strong>Criado por:</strong> {user.created_by_name ?? '—'}</div>
                      <div><strong>Alterado por:</strong> {user.updated_by_name ?? '—'}</div>
                    </div>
                  </div>
                  <button onClick={() => setEditingUser(user)} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '12px 14px', fontWeight: 800 }}>Editar</button>
                </div>
              </div>
            )) : <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, color: '#475467' }}>Nenhum usuário cadastrado além do acesso inicial.</div>}
          </div>
          <form onSubmit={submit} style={{ display: 'grid', gap: 14, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>{editingUser ? 'Editar usuário' : 'Novo usuário'}</h2>
              <p style={{ margin: '8px 0 0', color: '#667085', fontSize: 14 }}>Controle de acesso do time com trilha de autoria e alteração.</p>
            </div>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome" required style={fieldStyle} />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" required style={fieldStyle} />
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingUser ? 'Nova senha (opcional)' : 'Senha'} type="password" style={fieldStyle} required={!editingUser} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={fieldStyle}>
              <option value="admin">Admin</option>
              <option value="operacional">Operacional</option>
              <option value="financeiro">Financeiro</option>
            </select>
            {editingUser ? (
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#475467', fontSize: 14 }}>
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Usuário ativo
              </label>
            ) : null}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" style={{ background: 'linear-gradient(135deg, #111827 0%, #1d2939 100%)', color: '#fff', border: 0, borderRadius: 14, padding: '14px 18px', fontWeight: 800, boxShadow: '0 12px 24px rgba(17,24,39,0.18)' }}>{editingUser ? 'Salvar usuário' : 'Criar usuário'}</button>
              {editingUser ? <button type="button" onClick={() => setEditingUser(null)} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '14px 18px', fontWeight: 800 }}>Cancelar</button> : null}
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
