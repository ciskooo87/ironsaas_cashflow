from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    company_id: int
    name: str
    email: EmailStr
    password: str
    role: str = "operacional"


class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    password: str | None = None
    role: str = "operacional"
    is_active: bool = True


class UserOut(BaseModel):
    id: int
    company_id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_by_user_id: int | None = None
    updated_by_user_id: int | None = None
    created_by_name: str | None = None
    updated_by_name: str | None = None

    class Config:
        from_attributes = True
