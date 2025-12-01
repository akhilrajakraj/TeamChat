from fastapi import APIRouter, HTTPException, status
from src.schemas.auth import UserRegister, UserLogin, UserOut
from src.core.database import database
from src.core.security import get_password_hash, verify_password, create_access_token
from asyncpg.exceptions import UniqueViolationError

router = APIRouter()

@router.post("/register", response_model=UserOut)
async def register(user: UserRegister):
    hashed_pw = get_password_hash(user.password)
    # We use a default False for is_online
    query = """
        INSERT INTO users (username, email, password_hash, is_online)
        VALUES (:username, :email, :pw, FALSE)
        RETURNING id, username, email, is_online
    """
    values = {"username": user.username, "email": user.email, "pw": hashed_pw}
    
    try:
        new_user = await database.fetch_one(query=query, values=values)
        return new_user
    except UniqueViolationError:
        raise HTTPException(status_code=400, detail="Email or Username already exists")

@router.post("/login")
async def login(creds: UserLogin):
    query = "SELECT * FROM users WHERE email = :email"
    user = await database.fetch_one(query=query, values={"email": creds.email})

    if not user or not verify_password(creds.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate Token
    access_token = create_access_token(data={"sub": str(user['id'])})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"id": user['id'], "username": user['username'], "email": user['email']}
    }
