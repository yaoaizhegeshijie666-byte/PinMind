# Production deployment

1. Build `backend/Dockerfile` on an HTTPS-capable container platform.
2. Mount persistent storage at `/data`.
3. Configure `OPENROUTER_API_KEY`, a random `PINMIND_DEVICE_TOKEN`, a separate random `PINMIND_CRON_SECRET`, and the allowed `PINMIND_CORS_ORIGIN`.
4. Configure a daily cron at 22:00 Asia/Shanghai that sends `POST /api/jobs/nightly` with header `X-Cron-Secret`.
5. Enter the resulting HTTPS URL and device token in PinMind settings.

Do not put either secret in source control or APK assets. The server blocks private/link-local addresses during URL extraction.
