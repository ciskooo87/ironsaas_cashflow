from pydantic import BaseModel


class CompanyCreate(BaseModel):
    name: str
    legal_name: str | None = None
    cnpj: str | None = None
    timezone: str = "America/Sao_Paulo"


class CompanyOut(CompanyCreate):
    id: int

    class Config:
        from_attributes = True
