from fastapi import APIRouter
from api.get_user import create_user, get_user

main_router = APIRouter(prefix="/auth", tags=["auth"])
