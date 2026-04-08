export default function Home() {
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      <h1>IronSaaS Cashflow</h1>
      <p>MVP do Sprint A: Auth, Empresas, Contas, Categorias, Lançamentos e Saldo por Conta.</p>
      <section>
        <h2>Módulos iniciais</h2>
        <ul>
          <li>Controle de contas</li>
          <li>Lançamentos financeiros</li>
          <li>Categorias e classificação base</li>
          <li>Saldo atualizado por conta</li>
          <li>Base pronta para DFC e projeções</li>
        </ul>
      </section>
    </main>
  );
}
