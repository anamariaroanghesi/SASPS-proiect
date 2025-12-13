# CineVault - Movie App

A movie application with watchlist and rating features, built with Flask (backend) and React (frontend).

## Prerequisites

- [Docker](https://www.docker.com/get-started) & Docker Compose
- [Node.js](https://nodejs.org/) (v18+) - for frontend development

## Quick Start

### 1. Start Backend & Database

```bash
# Start PostgreSQL and Flask API
docker-compose up --build
```

This starts:
- PostgreSQL database on port `5432`
- Flask API on port `5000`
- Adminer (DB admin) on port `9090`

### 2. Import Database Schema

In a **new terminal**, run:

```bash
docker exec -i sasps-proiect-postgres_db-1 psql -U sasps_user -d moviedb < moviedb.sql
```

### 3. Start Frontend

In a **new terminal**, run:

```bash
cd services/frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

## Project Structure

```
├── docker-compose.yml      # Docker services configuration
├── moviedb.sql             # Database schema and seed data
├── services/
│   ├── backend_simple/     # Flask API
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── src/main.py
│   └── frontend/           # React app
│       ├── package.json
│       └── src/
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/movies` | List all movies |
| GET | `/movies/{id}?level=basic\|complex` | Get movie details |
| GET | `/users/{id}/watchlist` | Get user's watchlist |
| POST | `/users/{id}/watchlist` | Add to watchlist |
| DELETE | `/users/{id}/watchlist/{movie_id}` | Remove from watchlist |
| GET | `/users/{id}/viewed` | Get viewed movies |
| POST | `/users/{id}/viewed` | Mark as viewed with rating |
| DELETE | `/users/{id}/viewed/{movie_id}` | Remove from viewed |

## Tech Stack

- **Backend:** Python, Flask, PostgreSQL
- **Frontend:** React, Vite, React Router
- **Infrastructure:** Docker, Docker Compose
