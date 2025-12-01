import os
from databases import Database
from dotenv import load_dotenv

# Load .env file
load_dotenv('.env')

DATABASE_URL = os.getenv('DATABASE_URL')
db = Database(DATABASE_URL)

async def test_connection():
    try:
        await db.connect()
        val = await db.fetch_val("SELECT now()")
        print("Database connected successfully!")
        print("Current DB time:", val)
    except Exception as e:
        print("❌ Database connection failed:")
        print(e)
    finally:
        await db.disconnect()

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_connection())
