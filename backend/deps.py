import base64
import json
import os
from typing import Optional
from fastapi import Request, Depends
from sqlalchemy.orm import Session
from .db import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _decode_jwt_no_verify(token: str) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return {}
        payload_b64 = parts[1] + "==="
        payload = base64.urlsafe_b64decode(payload_b64[: len(payload_b64) - (len(payload_b64) % 4)])
        return json.loads(payload)
    except Exception:
        return {}


async def get_current_firebase_uid(request: Request) -> Optional[str]:
    authz = request.headers.get("authorization") or request.headers.get("Authorization")
    if not authz or not authz.lower().startswith("bearer "):
        return None
    token = authz.split(" ", 1)[1]
    verify = os.getenv("FIREBASE_VERIFY", "false").lower() == "true"
    if not verify:
        payload = _decode_jwt_no_verify(token)
        return payload.get("sub")
    # TODO: firebase-admin で厳密検証
    return None


