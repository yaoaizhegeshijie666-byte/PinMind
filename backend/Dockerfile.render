FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY server.py database.py /app/
COPY web /app/web
ENV HOST=0.0.0.0 PORT=8787 PINMIND_WEB_ROOT=/app/web
EXPOSE 8787
CMD ["python", "server.py"]
