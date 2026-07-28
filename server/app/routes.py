from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from . import db
from .models import User, Board, Task, BoardUpdate

api = Blueprint("api", __name__)


@api.route("/health", methods=["GET"])
def health_check():
    return jsonify({"message": "HobbyBoard API is running"}), 200


@api.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    existing_username = User.query.filter_by(username=username).first()
    if existing_username:
        return jsonify({"error": "Username is already taken"}), 409

    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({"error": "Email is already registered"}), 409

    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "User created successfully",
        "user": user.to_dict(),
        "access_token": access_token
    }), 201


@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "access_token": access_token
    }), 200


@api.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200


@api.route("/logout", methods=["POST"])
def logout():
    return jsonify({
        "message": "Logout successful. Remove the token on the frontend."
    }), 200


@api.route("/dashboard/stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    user_id = int(get_jwt_identity())

    board_count = Board.query.filter_by(user_id=user_id).count()

    user_tasks = Task.query.join(Board).filter(Board.user_id == user_id)
    total_tasks = user_tasks.count()
    completed_tasks = user_tasks.filter(Task.status == "Complete").count()
    in_progress_tasks = user_tasks.filter(Task.status == "In Progress").count()
    not_started_tasks = user_tasks.filter(Task.status == "Not Started").count()
    high_priority_tasks = user_tasks.filter(Task.priority == "High").count()

    completion_rate = round((completed_tasks / total_tasks) * 100, 1) if total_tasks else 0

    return jsonify({
        "stats": {
            "board_count": board_count,
            "task_count": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "not_started_tasks": not_started_tasks,
            "high_priority_tasks": high_priority_tasks,
            "completion_rate": completion_rate
        }
    }), 200


@api.route("/boards", methods=["GET"])
@jwt_required()
def get_boards():
    user_id = int(get_jwt_identity())

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    paginated_boards = Board.query.filter_by(user_id=user_id) \
        .order_by(Board.created_at.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)

    boards = [board.to_dict() for board in paginated_boards.items]

    return jsonify({
        "boards": boards,
        "page": paginated_boards.page,
        "per_page": paginated_boards.per_page,
        "total": paginated_boards.total,
        "pages": paginated_boards.pages
    }), 200


@api.route("/boards", methods=["POST"])
@jwt_required()
def create_board():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    title = data.get("title", "").strip()
    hobby_type = data.get("hobby_type", "").strip()
    description = data.get("description", "").strip()

    if not title or not hobby_type:
        return jsonify({"error": "Title and hobby type are required"}), 400

    board = Board(
        title=title,
        hobby_type=hobby_type,
        description=description,
        user_id=user_id
    )

    db.session.add(board)
    db.session.commit()

    return jsonify({
        "message": "Board created successfully",
        "board": board.to_dict()
    }), 201


@api.route("/boards/<int:board_id>", methods=["GET"])
@jwt_required()
def get_board(board_id):
    user_id = int(get_jwt_identity())

    board = Board.query.filter_by(id=board_id, user_id=user_id).first()

    if not board:
        return jsonify({"error": "Board not found"}), 404

    return jsonify({"board": board.to_dict(include_tasks=True)}), 200


@api.route("/boards/<int:board_id>", methods=["PATCH"])
@jwt_required()
def update_board(board_id):
    user_id = int(get_jwt_identity())

    board = Board.query.filter_by(id=board_id, user_id=user_id).first()

    if not board:
        return jsonify({"error": "Board not found"}), 404

    data = request.get_json()

    if "title" in data:
        title = data.get("title", "").strip()
        if not title:
            return jsonify({"error": "Title cannot be empty"}), 400
        board.title = title

    if "hobby_type" in data:
        hobby_type = data.get("hobby_type", "").strip()
        if not hobby_type:
            return jsonify({"error": "Hobby type cannot be empty"}), 400
        board.hobby_type = hobby_type

    if "description" in data:
        board.description = data.get("description", "").strip()

    db.session.commit()

    return jsonify({
        "message": "Board updated successfully",
        "board": board.to_dict()
    }), 200


@api.route("/boards/<int:board_id>", methods=["DELETE"])
@jwt_required()
def delete_board(board_id):
    user_id = int(get_jwt_identity())

    board = Board.query.filter_by(id=board_id, user_id=user_id).first()

    if not board:
        return jsonify({"error": "Board not found"}), 404

    db.session.delete(board)
    db.session.commit()

    return jsonify({"message": "Board deleted successfully"}), 200


@api.route("/boards/<int:board_id>/updates", methods=["GET"])
@jwt_required()
def get_board_updates(board_id):
    user_id = int(get_jwt_identity())

    board = Board.query.filter_by(id=board_id, user_id=user_id).first()

    if not board:
        return jsonify({"error": "Board not found"}), 404

    updates = BoardUpdate.query.filter_by(board_id=board.id) \
        .order_by(BoardUpdate.created_at.desc()) \
        .all()

    return jsonify({"updates": [update.to_dict() for update in updates]}), 200


@api.route("/boards/<int:board_id>/updates", methods=["POST"])
@jwt_required()
def create_board_update(board_id):
    user_id = int(get_jwt_identity())

    board = Board.query.filter_by(id=board_id, user_id=user_id).first()

    if not board:
        return jsonify({"error": "Board not found"}), 404

    data = request.get_json() or {}
    content = data.get("content", "").strip()

    if not content:
        return jsonify({"error": "Update content is required"}), 400

    update = BoardUpdate(
        content=content,
        board_id=board.id,
        user_id=user_id
    )

    db.session.add(update)
    db.session.commit()

    return jsonify({
        "message": "Update created successfully",
        "update": update.to_dict()
    }), 201


@api.route("/updates/<int:update_id>", methods=["DELETE"])
@jwt_required()
def delete_board_update(update_id):
    user_id = int(get_jwt_identity())

    update = BoardUpdate.query.join(Board).filter(
        BoardUpdate.id == update_id,
        Board.user_id == user_id
    ).first()

    if not update:
        return jsonify({"error": "Update not found"}), 404

    db.session.delete(update)
    db.session.commit()

    return jsonify({"message": "Update deleted successfully"}), 200

@api.route("/boards/<int:board_id>/tasks", methods=["GET"])
@jwt_required()
def get_tasks_for_board(board_id):
    user_id = int(get_jwt_identity())

    board = Board.query.filter_by(id=board_id, user_id=user_id).first()

    if not board:
        return jsonify({"error": "Board not found"}), 404

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    paginated_tasks = Task.query.filter_by(board_id=board.id) \
        .order_by(Task.created_at.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)

    tasks = [task.to_dict() for task in paginated_tasks.items]

    return jsonify({
        "tasks": tasks,
        "page": paginated_tasks.page,
        "per_page": paginated_tasks.per_page,
        "total": paginated_tasks.total,
        "pages": paginated_tasks.pages
    }), 200


@api.route("/boards/<int:board_id>/tasks", methods=["POST"])
@jwt_required()
def create_task(board_id):
    user_id = int(get_jwt_identity())

    board = Board.query.filter_by(id=board_id, user_id=user_id).first()

    if not board:
        return jsonify({"error": "Board not found"}), 404

    data = request.get_json()

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    status = data.get("status", "Not Started").strip()
    priority = data.get("priority", "Medium").strip()

    if not title:
        return jsonify({"error": "Task title is required"}), 400

    task = Task(
        title=title,
        description=description,
        status=status,
        priority=priority,
        board_id=board.id
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({
        "message": "Task created successfully",
        "task": task.to_dict()
    }), 201


@api.route("/tasks/<int:task_id>", methods=["GET"])
@jwt_required()
def get_task(task_id):
    user_id = int(get_jwt_identity())

    task = Task.query.join(Board).filter(
        Task.id == task_id,
        Board.user_id == user_id
    ).first()

    if not task:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"task": task.to_dict()}), 200


@api.route("/tasks/<int:task_id>", methods=["PATCH"])
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())

    task = Task.query.join(Board).filter(
        Task.id == task_id,
        Board.user_id == user_id
    ).first()

    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json()

    if "title" in data:
        title = data.get("title", "").strip()
        if not title:
            return jsonify({"error": "Task title cannot be empty"}), 400
        task.title = title

    if "description" in data:
        task.description = data.get("description", "").strip()

    if "status" in data:
        task.status = data.get("status", "").strip()

    if "priority" in data:
        task.priority = data.get("priority", "").strip()

    db.session.commit()

    return jsonify({
        "message": "Task updated successfully",
        "task": task.to_dict()
    }), 200


@api.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())

    task = Task.query.join(Board).filter(
        Task.id == task_id,
        Board.user_id == user_id
    ).first()

    if not task:
        return jsonify({"error": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "Task deleted successfully"}), 200
