from pydantic import BaseModel


class CategoryCreate(BaseModel):
    company_id: int
    name: str
    group_type: str
    direction: str = "ambos"


class CategoryUpdate(BaseModel):
    name: str
    group_type: str
    direction: str = "ambos"
    is_active: bool = True


class CategoryOut(CategoryCreate):
    id: int
    is_system: bool
    is_active: bool

    class Config:
        from_attributes = True
