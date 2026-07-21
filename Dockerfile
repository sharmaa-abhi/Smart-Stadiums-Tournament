# ─── StadiumGenius Multi-Stage Dockerfile ───
# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Stage 2: Build the Python backend
FROM python:3.12-slim AS backend

# Security: run as non-root
RUN groupadd -r stadium && useradd -r -g stadium stadium

WORKDIR /app

# Install Python dependencies
COPY server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY server/ ./server/

# Copy frontend build artifacts
COPY --from=frontend-builder /app/dist ./dist

# Environment defaults (override with docker-compose or -e flags)
ENV ENVIRONMENT=production \
    DATABASE_URL=sqlite:///./stadiumgenius.db \
    PYTHONUNBUFFERED=1

# Don't run as root
USER stadium

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Start FastAPI via uvicorn
CMD ["python", "-m", "uvicorn", "server.app.main:app", \
     "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "4", "--access-log"]
