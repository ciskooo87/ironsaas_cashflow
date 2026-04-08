from fastapi import FastAPI
from app.api.routes import router
from app.core.db import Base, engine
from app.models import entities  # noqa: F401

Base.metadata.create_all(bind=engine)
app = FastAPI(title='IronSaaS Cashflow API')
app.include_router(router, prefix='/api')

@app.get('/health')
def health():
    return {'status': 'ok'}
