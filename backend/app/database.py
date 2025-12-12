import os
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


def get_connection():
    """
    Return a new pymysql connection. Caller is responsible for closing.
    """
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


db_config = parse_database_url(DATABASE_URL)


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
