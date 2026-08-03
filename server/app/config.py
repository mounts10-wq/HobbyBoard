import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[1]
INSTANCE_DIR = BASE_DIR / "instance"
INSTANCE_DIR.mkdir(exist_ok=True)

DEFAULT_DB_PATH = INSTANCE_DIR / "hobbyboard.db"


def get_database_uri():
    configured_uri = os.getenv("DATABASE_URL")
    if not configured_uri:
        return f"sqlite:///{DEFAULT_DB_PATH}"

    if configured_uri.startswith("sqlite:///") and not configured_uri.startswith("sqlite:////"):
        relative_db = Path(configured_uri.replace("sqlite://", "", 1))
        if not relative_db.is_absolute():
            return f"sqlite:///{INSTANCE_DIR / relative_db.name}"

    return configured_uri


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me-32chars")
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key-change-me-32chars")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)