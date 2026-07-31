from datetime import datetime, timezone
from pathlib import Path
import shutil

from flask import Flask, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from sqlalchemy import inspect, text
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def _sqlite_db_path(database_uri):
    if database_uri.startswith("sqlite:////"):
        return Path(database_uri.replace("sqlite:////", "/", 1))

    if database_uri.startswith("sqlite:///"):
        return Path(database_uri.replace("sqlite:///", "", 1))

    return None


def create_daily_db_backup(app):
    database_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    db_path = _sqlite_db_path(database_uri)

    if not db_path or not db_path.exists():
        return

    backup_dir = db_path.parent / "backups"
    backup_dir.mkdir(exist_ok=True)

    backup_name = f"{db_path.stem}-{datetime.now(timezone.utc).strftime('%Y%m%d')}{db_path.suffix}"
    backup_path = backup_dir / backup_name

    if not backup_path.exists():
        shutil.copy2(db_path, backup_path)


def apply_additive_sqlite_schema_updates(app):
    database_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    if not database_uri.startswith("sqlite"):
        return

    inspector = inspect(db.engine)

    if "boards" in inspector.get_table_names():
        board_columns = {column["name"] for column in inspector.get_columns("boards")}
        if "is_public" not in board_columns:
            with db.engine.begin() as connection:
                connection.execute(text("ALTER TABLE boards ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT 0"))

    inspector = inspect(db.engine)
    if "board_updates" in inspector.get_table_names():
        update_columns = {column["name"] for column in inspector.get_columns("board_updates")}
        if "media_url" not in update_columns:
            with db.engine.begin() as connection:
                connection.execute(text("ALTER TABLE board_updates ADD COLUMN media_url TEXT"))

    table_names = set(inspector.get_table_names())
    with db.engine.begin() as connection:
        if "user_follows" not in table_names:
            connection.execute(text(
                """
                CREATE TABLE user_follows (
                    id INTEGER PRIMARY KEY,
                    follower_user_id INTEGER NOT NULL,
                    followed_user_id INTEGER NOT NULL,
                    created_at DATETIME,
                    CONSTRAINT uq_user_follow_pair UNIQUE (follower_user_id, followed_user_id),
                    FOREIGN KEY(follower_user_id) REFERENCES users(id),
                    FOREIGN KEY(followed_user_id) REFERENCES users(id)
                )
                """
            ))

        if "board_update_comments" not in table_names:
            connection.execute(text(
                """
                CREATE TABLE board_update_comments (
                    id INTEGER PRIMARY KEY,
                    content TEXT NOT NULL,
                    created_at DATETIME,
                    update_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    FOREIGN KEY(update_id) REFERENCES board_updates(id),
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
                """
            ))


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    @app.route("/")
    def root():
        return redirect("/api/health")

    CORS(app, supports_credentials=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from . import models
    from .routes import api

    with app.app_context():
        create_daily_db_backup(app)
        db.create_all()
        apply_additive_sqlite_schema_updates(app)

    app.register_blueprint(api, url_prefix="/api")

    return app