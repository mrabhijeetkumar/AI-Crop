import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings
from app.database.collections import USERS_COLLECTION

logger = logging.getLogger("aicrop.database")

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_instance = MongoDB()

import re

async def connect_to_mongo():
    try:
        masked_uri = re.sub(r'://([^:]+):([^@]+)@', r'://\1:****@', settings.MONGODB_URI) if settings.MONGODB_URI else ""
        logger.info(f"Connecting to MongoDB at {masked_uri}...")
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        db_instance.db = db_instance.client[settings.MONGODB_DB_NAME]
        try:
            await db_instance.db[USERS_COLLECTION].create_index("email", unique=True, name="users_email_unique")
        except Exception as index_error:
            logger.warning(f"User email index could not be created: {index_error}")
        logger.info(f"Connected to MongoDB database: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        logger.warning(f"MongoDB connection error: {e}. Falling back to in-memory persistence mode.")

async def close_mongo_connection():
    if db_instance.client is not None:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db_instance.db
