import os
from http.server import ThreadingHTTPServer

import server
from cloud_database import connect_cloud

server.db = connect_cloud

if __name__ == "__main__":
    connect_cloud().close()
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8787"))
    print(f"PinMind cloud backend http://{host}:{port}")
    ThreadingHTTPServer((host, port), server.Handler).serve_forever()
