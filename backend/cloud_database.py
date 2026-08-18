import os
from psycopg import connect
from psycopg.rows import dict_row

SCHEMA = (
    "CREATE TABLE IF NOT EXISTS sources(id TEXT PRIMARY KEY,input_type TEXT NOT NULL,title TEXT,content TEXT,url TEXT,starred INTEGER DEFAULT 0,status TEXT DEFAULT 'ready',captured_at TEXT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS knowledge(id TEXT PRIMARY KEY,digest_date TEXT NOT NULL,headline TEXT NOT NULL,sections_json TEXT NOT NULL,source_ids_json TEXT NOT NULL,topic_names_json TEXT NOT NULL,tags_json TEXT NOT NULL,state TEXT DEFAULT 'candidate',created_at TEXT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS digests(digest_date TEXT PRIMARY KEY,status TEXT NOT NULL,created_at TEXT NOT NULL)",
)

class CloudDatabase:
    def __init__(self):
        self.connection = connect(os.environ["DATABASE_URL"], row_factory=dict_row)
        with self.connection:
            for statement in SCHEMA:
                self.connection.execute(statement)
    def execute(self, query, params=None):
        if query.startswith("INSERT OR REPLACE INTO digests"):
            query = """INSERT INTO digests VALUES(%s,%s,%s)
                       ON CONFLICT(digest_date) DO UPDATE SET
                       status=excluded.status,created_at=excluded.created_at"""
        else:
            query = query.replace("?", "%s")
        return self.connection.execute(query, params or ())
    def close(self): self.connection.close()
    def __enter__(self):
        self.connection.__enter__()
        return self
    def __exit__(self, exc_type, exc_value, traceback):
        return self.connection.__exit__(exc_type, exc_value, traceback)

def connect_cloud():
    return CloudDatabase()
