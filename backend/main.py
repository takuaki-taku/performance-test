from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import ensure_schema
from .routers import me as me_router
from .routers import users as users_router
from .routers import stats as stats_router
from .routers import flexibility as flexibility_router


# Initialize DB schema (idempotent)
ensure_schema()


app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(me_router.router)
app.include_router(users_router.router)
app.include_router(stats_router.router)
app.include_router(flexibility_router.router)
