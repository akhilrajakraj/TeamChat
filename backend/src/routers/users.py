from fastapi import APIRouter
from src.core.database import database
from typing import List
from pydantic import BaseModel

class UserStatus(BaseModel):
    id: int
    username: str
    is_online: bool

router = APIRouter()

@router.get("/", response_model=List[UserStatus])
async def get_all_users():
    # Return all users so we can build the sidebar list
    return await database.fetch_all("SELECT id, username, is_online FROM users ORDER BY username ASC")
