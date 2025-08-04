import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

# Navigate up from core -> src -> backend to find the .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# Initialize Firebase Admin SDK
# A placeholder service account file should be placed at the path specified
# by GOOGLE_APPLICATION_CREDENTIALS in the .env file.
try:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and os.path.exists(os.path.join(os.path.dirname(__file__), '..', '..', cred_path)):
        cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), '..', '..', cred_path))
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully from certificate.")
    else:
        # This will work in cloud environments where the variable is set directly.
        # For local development, the file is required.
        print("GOOGLE_APPLICATION_CREDENTIALS not found or path is invalid. Attempting default initialization.")
        firebase_admin.initialize_app()
        print("Firebase Admin SDK initialized successfully with default credentials.")
except Exception as e:
    print(f"CRITICAL: Failed to initialize Firebase Admin SDK. Auth will not work. Error: {e}")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # The 'tokenUrl' is a placeholder

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency to get the current user from a Firebase JWT.
    Verifies the token and returns the user's decoded claims (dict).
    Raises HTTPException for invalid tokens.
    """
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Authentication token has expired")
    except Exception as e:
        print(f"An unexpected error occurred during token verification: {e}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")
