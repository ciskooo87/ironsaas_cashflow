# Arquitetura

## Domínios
- ingestion/
- classification/
- cashflow/
- projections/
- analytics/
- governance/

## MVP técnico
Monólito modular com FastAPI + SQLAlchemy + PostgreSQL.

## Fluxo principal
1. Usuário lança movimentação
2. Sistema classifica/sugere categoria
3. Motor recalcula saldo por conta
4. DFC e dashboard consomem base estruturada

## Princípios
- Nada de fórmula de planilha
- Tudo auditável
- Estrutura contábil/financeira explícita
- Leitura executiva em cima da operação
