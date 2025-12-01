from fastapi import APIRouter, HTTPException
from typing import List
from src.schemas.message import MessageOut
from src.core.database import database

router = APIRouter()

@router.get("/{channel_id}", response_model=List[MessageOut])
async def get_message_history(channel_id: int, limit: int = 50, offset: int = 0):
    # Retrieve messages with the sender's username
    query = """
        SELECT m.id, m.content, m.created_at, m.channel_id, u.username as sender
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.channel_id = :cid
        ORDER BY m.created_at DESC
        LIMIT :limit OFFSET :offset
    """
    return await database.fetch_all(query=query, values={"cid": channel_id, "limit": limit, "offset": offset})
