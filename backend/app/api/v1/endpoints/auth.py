from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.api.dependencies import get_db, get_current_user, oauth2_scheme
from backend.app.schemas.auth import UserCreate, UserLogin, Token
from backend.app.crud.user import user as crud_user
from backend.app.core.security import create_access_token, create_refresh_token, ALGORITHM
from backend.app.models.user import User
from jose import JWTError, jwt
from fastapi.security import HTTPAuthorizationCredentials
from backend.app.core.config import settings
import uuid

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserCreate,
):
    # Проверка на существование
    existing_user = await crud_user.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists",
        )
    user = await crud_user.create(db, obj_in=user_in)
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/login", response_model=Token)
async def login(
    *,
    db: AsyncSession = Depends(get_db),
    login_in: UserLogin,
):
    user = await crud_user.authenticate(db, email=login_in.email, password=login_in.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),  # зависимость из dependencies
    db: AsyncSession = Depends(get_db),
):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db.get(User, uuid.UUID(user_id))
    if user is None or not user.is_active:
        raise credentials_exception

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}