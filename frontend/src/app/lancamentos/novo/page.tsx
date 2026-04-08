import { LaunchForm } from '@/components/LaunchForm';
import { AppShell } from '@/components/AppShell';

export default function NovoLancamentoPage() {
  return (
    <AppShell title="Novo lançamento" subtitle="Registrar entradas e saídas com menos atrito operacional e suporte a comprovante.">
      <LaunchForm />
    </AppShell>
  );
}
