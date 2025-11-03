from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from ..deps import get_current_firebase_uid, get_db
from .. import models
from ..schemas import UserRead

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/me", response_model=UserRead)
async def get_me(request: Request, db: Session = Depends(get_db)):
    uid = await get_current_firebase_uid(request)
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user = db.query(models.User).filter(
        models.User.firebase_uid == uid).first()
    if user is None:
        user = models.User(name="User", grade="", firebase_uid=uid)
        db.add(user)
        db.commit()
        db.refresh(user)
    if not user.results:
        user.results = []
    return user
