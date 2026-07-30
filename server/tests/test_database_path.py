from pathlib import Path

from app import create_app


def test_database_uri_uses_instance_directory():
    app = create_app()
    expected_db = Path(__file__).resolve().parents[1] / "instance" / "hobbyboard.db"

    assert app.config["SQLALCHEMY_DATABASE_URI"] == f"sqlite:///{expected_db}"
