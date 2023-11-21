from fastapi import FastAPI

from api.router import main_router

app = FastAPI()
app.include_router(router=main_router)
