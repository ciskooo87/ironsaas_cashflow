import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 32, background: '#f7f8fa' }}>
      <LoginForm />
    </main>
  );
}
