from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.database import database
from src.routers import auth, channels, messages, users # <--- Added users
from src.sockets import sio_app
import os
from dotenv import load_dotenv

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    print("✅ Database Connected")
    yield
    await database.disconnect()
    print("❌ Database Disconnected")

app = FastAPI(lifespan=lifespan)

origins = [os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/socket.io", sio_app)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(channels.router, prefix="/api/channels", tags=["Channels"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(users.router, prefix="/api/users", tags=["Users"]) # <--- Added this

@app.get("/")
def read_root():
    return {"message": "TeaChat API is running"}
