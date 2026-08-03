import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app, db


@pytest.fixture
def client():
    app = create_app()
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite:///:memory:",
        JWT_SECRET_KEY="test-jwt-secret-key-at-least-32-bytes",
    )

    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


def test_assistant_plan_returns_contextual_suggestions(client):
    response = client.post(
        "/api/assistant/plan",
        json={
            "title": "Pottery Mug Project",
            "description": "Practice wheel throwing",
            "materials": "clay, glaze",
            "notes": "Need to center the clay",
        },
    )

    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data["suggestions"], list)
    assert len(data["suggestions"]) >= 3
    joined = " ".join(data["suggestions"]).lower()
    assert "pottery mug project" in joined or "pottery mug" in joined
    assert "clay" in joined and "glaze" in joined
