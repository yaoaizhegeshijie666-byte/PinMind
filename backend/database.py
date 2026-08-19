import json
import os
import sqlite3
from pathlib import Path

ROOT = Path(__file__).parent
DB_PATH = Path(os.getenv("PINMIND_DB", ROOT / "pinmind.db"))
DATABASE_URL = os.getenv("DATABASE_URL", "")

TABLES = (
    """CREATE TABLE IF NOT EXISTS sources(
       id TEXT PRIMARY KEY,input_type TEXT NOT NULL,title TEXT,content TEXT,url TEXT,
       starred INTEGER DEFAULT 0,status TEXT DEFAULT 'ready',captured_at TEXT NOT NULL,
       content_mime TEXT,image_data TEXT,completeness TEXT DEFAULT 'complete',
       parse_status TEXT DEFAULT 'success',generated_at TEXT,generated_knowledge_ids_json TEXT DEFAULT '[]')""",
    """CREATE TABLE IF NOT EXISTS knowledge(
       id TEXT PRIMARY KEY,digest_date TEXT NOT NULL,headline TEXT NOT NULL,sections_json TEXT NOT NULL,
       source_ids_json TEXT NOT NULL,topic_names_json TEXT NOT NULL,tags_json TEXT NOT NULL,
       state TEXT DEFAULT 'candidate',created_at TEXT NOT NULL,type TEXT DEFAULT 'viewpoint',
       related_knowledge_ids_json TEXT DEFAULT '[]',content_completeness TEXT DEFAULT 'complete')""",
    """CREATE TABLE IF NOT EXISTS digests(
       digest_date TEXT PRIMARY KEY,status TEXT NOT NULL,created_at TEXT NOT NULL,
       source_ids_json TEXT DEFAULT '[]')""",
)

SOURCE_COLUMNS = {
    "content_mime": "TEXT", "image_data": "TEXT", "completeness": "TEXT DEFAULT 'complete'",
    "parse_status": "TEXT DEFAULT 'success'", "generated_at": "TEXT",
    "generated_knowledge_ids_json": "TEXT DEFAULT '[]'", "owner_id": "TEXT",
}
KNOWLEDGE_COLUMNS = {
    "type": "TEXT DEFAULT 'viewpoint'", "related_knowledge_ids_json": "TEXT DEFAULT '[]'",
    "content_completeness": "TEXT DEFAULT 'complete'", "owner_id": "TEXT",
}
DIGEST_COLUMNS = {"source_ids_json": "TEXT DEFAULT '[]'"}

def connect():
    if DATABASE_URL:
        from psycopg import connect as pg_connect
        from psycopg.rows import dict_row
        raw = pg_connect(DATABASE_URL, row_factory=dict_row)
    else:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        raw = sqlite3.connect(DB_PATH)
        raw.row_factory = sqlite3.Row
    database = Database(raw, bool(DATABASE_URL))
    database.ensure_schema()
    return database

class Database:
    def __init__(self, connection, postgres):
        self.connection = connection
        self.postgres = postgres
    def execute(self, query, params=None):
        if self.postgres:
            query = query.replace("?", "%s")
        return self.connection.execute(query, params or ())
    def ensure_schema(self):
        with self.connection:
            for statement in TABLES:
                self.connection.execute(statement)
            self._columns("sources", SOURCE_COLUMNS)
            self._columns("knowledge", KNOWLEDGE_COLUMNS)
            self._columns("digests", DIGEST_COLUMNS)
            self._remove_demo_records()
            self._backfill_generated_sources()
    def _columns(self, table, columns):
        if self.postgres:
            for name, definition in columns.items():
                self.connection.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {name} {definition}")
            return
        existing={row[1] for row in self.connection.execute(f"PRAGMA table_info({table})")}
        for name, definition in columns.items():
            if name not in existing:
                self.connection.execute(f"ALTER TABLE {table} ADD COLUMN {name} {definition}")
    def _remove_demo_records(self):
        titles=("链接解析测试","PinMind 云端测试")
        rows=self.execute("SELECT id FROM sources WHERE title IN (?,?)",titles).fetchall()
        demo_ids={row["id"] if hasattr(row,"keys") else row[0] for row in rows}
        if not demo_ids:return
        knowledge=self.execute("SELECT id,source_ids_json FROM knowledge").fetchall()
        for row in knowledge:
            source_json=row["source_ids_json"] if hasattr(row,"keys") else row[1]
            try:source_ids=set(json.loads(source_json or "[]"))
            except Exception:source_ids=set()
            if source_ids and source_ids.issubset(demo_ids):
                knowledge_id=row["id"] if hasattr(row,"keys") else row[0]
                self.execute("DELETE FROM knowledge WHERE id=?",(knowledge_id,))
        for source_id in demo_ids:self.execute("DELETE FROM sources WHERE id=?",(source_id,))
    def _backfill_generated_sources(self):
        rows=self.execute("SELECT source_ids_json FROM knowledge").fetchall()
        source_ids=set()
        for row in rows:
            value=row["source_ids_json"] if hasattr(row,"keys") else row[0]
            try: source_ids.update(json.loads(value or "[]"))
            except Exception: pass
        for source_id in source_ids:
            self.execute("UPDATE sources SET generated_at=COALESCE(generated_at,captured_at),status=CASE WHEN status='ready' THEN 'generated' ELSE status END WHERE id=?",(source_id,))
    def upsert_digest(self, day, status, created_at, source_ids_json):
        query = """INSERT INTO digests(digest_date,status,created_at,source_ids_json) VALUES(?,?,?,?)
                   ON CONFLICT(digest_date) DO UPDATE SET status=excluded.status,
                   created_at=excluded.created_at,source_ids_json=excluded.source_ids_json"""
        self.execute(query, (day, status, created_at, source_ids_json))
    def close(self): self.connection.close()
    def __enter__(self):
        self.connection.__enter__()
        return self
    def __exit__(self, exc_type, exc_value, traceback):
        return self.connection.__exit__(exc_type, exc_value, traceback)
