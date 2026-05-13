import os
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from .firebase import get_current_user as get_firebase_user
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from ..db.database import get_db
from supabase import create_client, Client

# Load env
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# Initialize Supabase client for verification
supabase_client: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

FIREBASE_CONFIGURED = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH") is not None and os.path.exists(os.path.join(os.path.dirname(__file__), '..', '..', os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "")))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # 1. Try Firebase first if configured
    if FIREBASE_CONFIGURED:
        try:
            return await get_firebase_user(token)
        except HTTPException:
            pass

    # 2. Try Supabase via API (more robust than local JWT decode)
    if supabase_client:
        try:
            # This verifies the token with Supabase and returns the user
            response = supabase_client.auth.get_user(token)
            if response and response.user:
                print(f"DEBUG: Successfully authenticated Supabase user: {response.user.email}")
                return {
                    "uid": response.user.id,
                    "email": response.user.email,
                    "provider": "supabase"
                }
        except Exception as e:
            # If Supabase API check fails, we can fall back to local decode if secret is available
            print(f"DEBUG: Supabase API auth failed: {e}")
            pass

    # 3. Fallback to local JWT decode
    if SUPABASE_JWT_SECRET and SUPABASE_JWT_SECRET != "your-supabase-jwt-secret":
        try:
            payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
            print(f"DEBUG: Successfully authenticated user via local JWT: {payload.get('email')}")
            return {
                "uid": payload.get("sub"),
                "email": payload.get("email"),
                "provider": "supabase"
            }
        except JWTError as e:
            print(f"DEBUG: Local JWT decode failed: {e}")
            raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {e}")
    
    raise HTTPException(status_code=401, detail="Authentication failed. Please check your credentials.")

async def check_active_subscription(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    from ..crud import user as crud_user, subscription as crud_subscription
    
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    sub = crud_subscription.get_subscription_by_org_id(db, organization_id=db_user.organization_id)
    if not sub or sub.status != "active":
        raise HTTPException(
            status_code=402, 
            detail="Active subscription required. Please upgrade your plan."
        )
    return sub
