from app.core.db import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.entities import Company, User, Account, Category

Base.metadata.create_all(bind=engine)

def run():
    db = SessionLocal()
    try:
        company = db.query(Company).filter_by(name="IronSaaS Demo").first()
        if not company:
            company = Company(name="IronSaaS Demo", legal_name="IronSaaS Demo Ltda", timezone="America/Sao_Paulo")
            db.add(company)
            db.commit()
            db.refresh(company)

        user = db.query(User).filter_by(email="admin@ironsaas.local").first()
        if not user:
            user = User(company_id=company.id, name="Admin", email="admin@ironsaas.local", password_hash=hash_password("admin123"), role="admin")
            db.add(user)

        if not db.query(Account).filter_by(company_id=company.id, name="Banco Principal").first():
            db.add(Account(company_id=company.id, name="Banco Principal", type="banco", bank_name="Banco Demo", initial_balance=10000, current_balance=10000))

        defaults = [
            ("Recebimentos", "operacional", "entrada"),
            ("Fornecedores", "operacional", "saida"),
            ("Folha", "operacional", "saida"),
            ("Impostos", "operacional", "saida"),
            ("Capex", "investimento", "saida"),
            ("Empréstimos", "financiamento", "entrada"),
            ("Amortizações", "financiamento", "saida"),
        ]
        for name, group_type, direction in defaults:
            if not db.query(Category).filter_by(company_id=company.id, name=name).first():
                db.add(Category(company_id=company.id, name=name, group_type=group_type, direction=direction, is_system=True))

        db.commit()
        print({"company_id": company.id, "admin_email": "admin@ironsaas.local", "admin_password": "admin123"})
    finally:
        db.close()

if __name__ == '__main__':
    run()
