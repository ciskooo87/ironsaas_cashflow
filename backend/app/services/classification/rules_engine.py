from app.models.entities import Category


def suggest_category(description: str, categories: list[Category]) -> int | None:
    text = (description or '').lower()
    rules = {
        'cliente': ['receb', 'cliente', 'venda'],
        'fornecedor': ['fornecedor', 'boleto fornecedor', 'pagamento fornecedor'],
        'folha': ['folha', 'salario', 'salário', 'prolabore', 'pró-labore'],
        'impostos': ['imposto', 'tributo', 'das', 'icms', 'pis', 'cofins'],
        'capex': ['equipamento', 'máquina', 'maquina', 'computador', 'ativo'],
        'empréstimos': ['emprestimo', 'empréstimo', 'financiamento', 'capital de giro'],
        'amortizações': ['amortizacao', 'amortização', 'parcela emprestimo', 'parcela empréstimo'],
    }
    for category in categories:
        name = category.name.lower()
        for _, terms in rules.items():
            if any(term in text for term in terms) and any(key in name for key in [category.name.lower(), name]):
                return category.id
        if name in text:
            return category.id
    return None
