import { LaunchForm } from '@/components/LaunchForm';
import { AppShell } from '@/components/AppShell';

export default function NovoLancamentoPage() {
  return (
    <AppShell title="Novo lançamento" subtitle="Registrar entradas e saídas com menos atrito operacional, melhor preenchimento e suporte a comprovante.">
      <LaunchForm />
    </AppShell>
  );
}
