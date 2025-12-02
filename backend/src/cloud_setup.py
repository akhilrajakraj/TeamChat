import asyncio
import os
from databases import Database

# 1. DEFINE THE COMPLETE SCHEMA
# This includes all tables and the columns we added later (is_online, user_id)
SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    channel_id INTEGER REFERENCES channels(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS channel_members (
    channel_id INTEGER REFERENCES channels(id),
    user_id INTEGER REFERENCES users(id),
    PRIMARY KEY (channel_id, user_id)
);

-- Index for pagination performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON messages(channel_id, created_at DESC);
"""

async def init_cloud_db():
    # Get URL from environment (we will pass this in the terminal)
    database_url = os.getenv("CLOUD_DATABASE_URL")
    
    if not database_url:
        print("❌ Error: CLOUD_DATABASE_URL is missing.")
        return

    print(f"🚀 Connecting to Cloud DB: {database_url.split('@')[-1]}...") 
    
    database = Database(database_url)
    
    try:
        await database.connect()
        print("✅ Connected! Creating tables...")
        
        # Split by ; to run multiple commands
        statements = SCHEMA_SQL.split(';')
        for statement in statements:
            if statement.strip():
                await database.execute(statement)
                
        print("✅ Tables created successfully.")
        
        # Optional: Create a default channel
        try:
            await database.execute("INSERT INTO channels (name, description) VALUES (:name, :desc)", 
                                 values={"name": "General", "desc": "The main lobby"})
            print("✅ Default '#General' channel created.")
        except Exception:
            print("ℹ️ '#General' channel already exists.")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await database.disconnect()

if __name__ == "__main__":
    asyncio.run(init_cloud_db())