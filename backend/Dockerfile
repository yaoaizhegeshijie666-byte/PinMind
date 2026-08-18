FROM python:3.12-slim
WORKDIR /app
COPY server.py /app/server.py
ENV HOST=0.0.0.0 PORT=8787 PINMIND_DB=/data/pinmind.db
VOLUME ["/data"]
EXPOSE 8787
CMD ["python", "server.py"]
