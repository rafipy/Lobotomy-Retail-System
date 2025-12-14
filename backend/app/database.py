import os
from pathlib import Path
from typing import Generator
from urllib.parse import urlparse

import pymysql
from pymysql.cursors import DictCursor

DATABASE_URL = os.getenv(
    "DATABASE_URL", "mysql+pymysql://retail_user:retail_password@db:3306/retail"
)


def parse_database_url(url: str) -> dict:
    if url.startswith("mysql+pymysql://"):
        url = url.replace("mysql+pymysql://", "mysql://", 1)
    parsed = urlparse(url)
    return {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 3306,
        "user": parsed.username or "",
        "password": parsed.password or "",
        "db": (parsed.path or "").lstrip("/") or "",
    }


db_config = parse_database_url(DATABASE_URL)


def get_connection():
    return pymysql.connect(
        host=db_config["host"],
        port=int(db_config["port"]),
        user=db_config["user"],
        password=db_config["password"],
        db=db_config["db"],
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=False,
    )


def get_db() -> Generator[dict, None, None]:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        yield {"conn": conn, "cursor": cursor}
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def init_db():
    sql_file = Path(__file__).parent / "create_tables.sql"
    with open(sql_file, "r") as f:
        sql_content = f.read()

    conn = get_connection()
    cursor = conn.cursor()
    try:
        statements = [s.strip() for s in sql_content.split(";") if s.strip()]
        for statement in statements:
            cursor.execute(statement)
        conn.commit()
        print("Database tables initialized successfully.")
    except Exception as e:
        conn.rollback()
        print(f"Error initializing database: {e}")
        raise
    finally:
        cursor.close()
        conn.close()
