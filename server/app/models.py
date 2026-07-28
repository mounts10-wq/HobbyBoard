from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)

    boards = db.relationship(
        "Board",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    board_updates = db.relationship(
        "BoardUpdate",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email
        }


class Board(db.Model):
    __tablename__ = "boards"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    hobby_type = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", back_populates="boards")
    tasks = db.relationship(
        "Task",
        back_populates="board",
        cascade="all, delete-orphan"
    )
    updates = db.relationship(
        "BoardUpdate",
        back_populates="board",
        cascade="all, delete-orphan"
    )

    def to_dict(self, include_tasks=False):
        board_dict = {
            "id": self.id,
            "title": self.title,
            "hobby_type": self.hobby_type,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
            "user_id": self.user_id
        }

        if include_tasks:
            board_dict["tasks"] = [task.to_dict() for task in self.tasks]

        return board_dict


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default="Not Started")
    priority = db.Column(db.String(50), default="Medium")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    board_id = db.Column(db.Integer, db.ForeignKey("boards.id"), nullable=False)

    board = db.relationship("Board", back_populates="tasks")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "created_at": self.created_at.isoformat(),
            "board_id": self.board_id
        }


class BoardUpdate(db.Model):
    __tablename__ = "board_updates"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    board_id = db.Column(db.Integer, db.ForeignKey("boards.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    board = db.relationship("Board", back_populates="updates")
    user = db.relationship("User", back_populates="board_updates")

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
            "board_id": self.board_id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
        }