import os
import sqlite3
from pathlib import Path

ROOT = Path(__file__).parent
DB_PATH = Path(os.getenv("PINMIND_DB", ROOT / "pinmind.db"))
DATABASE_URL = os.getenv("DATABASE_URL", "")
SCHEMA = (
    "CREATE TABLE IF NOT EXISTS sources(id TEXT PRIMARY KEY,input_type TEXT NOT NULL,title TEXT,content TEXT,url TEXT,starred INTEGER DEFAULT 0,status TEXT DEFAULT 'ready',captured_at TEXT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS knowledge(id TEXT PRIMARY KEY,digest_date TEXT NOT NULL,headline TEXT NOT NULL,sections_json TEXT NOT NULL,source_ids_json TEXT NOT NULL,topic_names_json TEXT NOT NULL,tags_json TEXT NOT NULL,state TEXT DEFAULT 'candidate',created_at TEXT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS digests(digest_date TEXT PRIMARY KEY,status TEXT NOT NULL,created_at TEXT NOT NULL)",
)

def connect():
    if DATABASE_URL:
        from psycopg import connect as pg_connect
        from psycopg.rows import dict_row
        connection = pg_connect(DATABASE_URL, row_factory=dict_row)
    else:
        connection = sqlite3.connect(DB_PATH)
        connection.row_factory = sqlite3.Row
    with connection:
        for statement in SCHEMA:
            connection.execute(statement)
    return Database(connection, bool(DATABASE_URL))

class Database:
    def __init__(self, connection, postgres):
        self.connection = connection
        self.postgres = postgres
    def execute(self, query, params=None):
        if self.postgres:
            query = query.replace("?", "%s")
        return self.connection.execute(query, params or ())
    def upsert_digest(self, day, status, created_at):
        query = """INSERT INTO digests(digest_date,status,created_at)
                   VALUES(?,?,?) ON CONFLICT(digest_date) DO UPDATE SET
                   status=excluded.status,created_at=excluded.created_at"""
        self.execute(query, (day, status, created_at))
    def close(self): self.connection.close()
    def __enter__(self):
        self.connection.__enter__()
        return self
    def __exit__(self, exc_type, exc_value, traceback):
        return self.connection.__exit__(exc_type, exc_value, traceback)
