from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.security.jwt import decode_access_token
from app.database.mongodb import get_database
from app.database.collections import USERS_COLLECTION
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user_optional(token: str | None = Depends(oauth2_scheme)) -> dict | None:
    if not token:
        return None
    payload = decode_access_token(token)
    if payload is None:
        return None
    user_id = payload.get("sub")
    if user_id is None:
        return None
        
    db = get_database()
    if db is not None:
        try:
            user = await db[USERS_COLLECTION].find_one({"_id": ObjectId(user_id)})
            if user:
                user["id"] = str(user["_id"])
                return user
        except Exception:
            pass
            
    # Mock/fallback user for development if DB is offline or mock mode
    return {
        "id": user_id,
        "email": payload.get("email", "farmer@aicrop.com"),
        "full_name": payload.get("name", "Demo Farmer"),
        "role": payload.get("role", "farmer"),
    }

async def get_current_user(user: dict | None = Depends(get_current_user_optional)) -> dict:
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
