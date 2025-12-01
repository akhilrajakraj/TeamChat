import asyncio
import os
from dotenv import load_dotenv
from databases import Database
from passlib.context import CryptContext

load_dotenv()

async def diagnose():
    print(f"\n--- DIAGNOSTIC REPORT ---")
    print(f"Working Directory: {os.getcwd()}")
    
    # 1. TEST PASSWORDS (BCrypt)
    try:
        ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        h = ctx.hash("test")
        print("✅ BCrypt: Installed & Working")
    except Exception as e:
        print(f"❌ BCrypt: FAILED. Run: pip install bcrypt passlib")
        print(f"   Error: {e}")
        return

    # 2. TEST DATABASE
    url = os.getenv("DATABASE_URL")
    if not url:
        print("❌ .env: DATABASE_URL is missing!")
        return
    
    # Mask password for display
    safe_url = url.split("@")[-1] 
    print(f"Connecting to: ...@{safe_url}")

    database = Database(url)
    try:
        await database.connect()
        print("✅ DB Connection: SUCCESS")
    except Exception as e:
        print(f"❌ DB Connection: FAILED")
        print(f"   Error: {e}")
        await database.disconnect()
        return

    # 3. TEST TABLE
    try:
        # We try to select 1 user
        query = "SELECT * FROM users LIMIT 1"
        await database.fetch_one(query=query)
        print("✅ Table 'users': EXISTS and is readable")
    except Exception as e:
        print(f"❌ Table 'users': FAILED (Table might be missing)")
        print(f"   Error: {e}")

    await database.disconnect()
    print("-------------------------\n")

if __name__ == "__main__":
    asyncio.run(diagnose())
