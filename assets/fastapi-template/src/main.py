from fastapi import FastAPI
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from src.api.root_router import root_router
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


load_dotenv()
app = FastAPI(lifespan=lifespan)
app.include_router(router=root_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root_get():
    return "Hello world from Visual Backend server!"


# from fastapi import FastAPI

# from api.router import main_router

# app = FastAPI()
# app.include_router(router=main_router)
