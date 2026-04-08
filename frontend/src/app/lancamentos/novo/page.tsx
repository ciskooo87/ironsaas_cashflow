import { LaunchForm } from '@/components/LaunchForm';

export default function NovoLancamentoPage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 32 }}>
      <h1>Novo lançamento</h1>
      <p>Fluxo inicial do próximo sprint para criar entradas e saídas com comprovante e sugestão de categoria.</p>
      <LaunchForm />
    </main>
  );
}
