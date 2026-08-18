# PinMind backend

Requires Python 3.10+ and no third-party packages.

PowerShell:

```powershell
$env:OPENAI_API_KEY = 'set-this-locally'
python server.py
```

Endpoints: `GET /health`, `POST/GET /api/sources`, `POST /api/digests/generate`, `GET /api/digests/today`.
The API key remains server-side. Do not add it to Android assets or frontend JavaScript.
