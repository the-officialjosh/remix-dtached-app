# Dtached Tournament Platform

Monorepo for the Dtached football tournament platform.

## Prerequisites

- **Docker** & **Docker Compose** (v2+)
- **Java 25** (for local dev without Docker)
- **Maven 3.9+** (for local dev without Docker)
- **Node.js 22+** (for frontend dev)

## Structure

```
├── frontend/    React + Vite (port 3000 in Docker, 5173 in dev)
├── backend/     Spring Boot API (port 8080)
└── docker-compose.yml
```

## Quick Start (Docker)

```bash
# 1. Copy env file and set your secrets
cp .env.example .env

# 2. Start all services
docker-compose up --build

# 3. Access
# Frontend:  http://localhost:3000
# API:       http://localhost:8080/api
# Swagger:   http://localhost:3000/swagger-ui/index.html
# Health:    http://localhost:3000/actuator/health
```

## Local Development (without Docker)

### Backend
```bash
cd backend
mvn spring-boot:run -Dspring.profiles.active=dev
# Uses H2 in-memory database
# H2 Console: http://localhost:8080/h2-console
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_PASSWORD` | PostgreSQL password | Yes (Docker) |
| `JWT_SECRET` | JWT signing key (min 256 bits) | Yes |
| `SPRING_PROFILES_ACTIVE` | `dev` or `docker` | No (defaults to `dev`) |
