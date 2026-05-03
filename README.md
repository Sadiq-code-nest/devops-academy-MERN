# DevOps Academy — Docker Compose Deployment

> **Branch:** `docker-compose`
> Demonstrates running the complete MERN stack (MongoDB + Backend + Frontend) with a single command using Docker Compose.

---

## Overview

One command starts three containers — wired together automatically.

```
devops_mongo     →  MongoDB 7 (internal only)
devops_backend   →  Node.js/Express → port 5000
devops_frontend  →  React + Nginx   → port 80
```

```
Browser → Frontend :80
              └── /api/ → Backend :5000 → MongoDB (internal)
```

MongoDB is not exposed externally. Backend connects via Docker internal hostname `mongo`.

---

## Prerequisites

```bash
docker -v               # Docker 24+
docker compose version  # Compose v2+
```

Install:
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## Setup

### 1. Clone

```bash
git clone -b docker-compose https://github.com/your-username/devops-academy.git
cd devops-academy
```

### 2. Create .env file

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

```env
PORT=5000
# Note: MONGO_URI is overridden in docker-compose.yml to use container hostname
# The value below is used for local dev only
MONGO_URI=mongodb://mongo:27017/devops-academy
JWT_SECRET=your_long_random_secret_here
NODE_ENV=production
CLIENT_URL=http://localhost
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

```bash
cp frontend/.env.example frontend/.env
nano frontend/.env
```

```env
VITE_API_URL=http://localhost/api
```

---

## Run

### Start everything

```bash
docker compose up --build -d
```

That's it. All 3 services start in the correct order.

### Seed admin user

```bash
docker exec devops_backend node seed.js
```

---

## Verify

```bash
docker compose ps                          # all 3 containers running
docker compose logs backend                # backend logs
docker compose logs frontend               # nginx logs
docker compose logs mongo                  # mongo logs
curl http://localhost/api/health           # API check
```

---

## Access

```
Site      →  http://localhost
API       →  http://localhost/api/health
Login     →  http://localhost/login
Admin     →  http://localhost/adminlogin
```

---

## Docker Compose Commands

```bash
docker compose up -d                       # start all (detached)
docker compose up --build -d               # rebuild + start
docker compose down                        # stop + remove containers
docker compose down -v                     # stop + remove + delete volumes (⚠ wipes DB)
docker compose restart backend             # restart one service
docker compose logs -f backend             # follow logs
docker compose exec backend sh             # shell into backend
docker compose exec mongo mongosh          # MongoDB shell
docker compose ps                          # status
docker compose pull                        # update images
```

---

## Update After Code Changes

```bash
# Rebuild and restart only the changed service
docker compose up --build -d backend

# Or rebuild everything
docker compose down
docker compose up --build -d
```

---

## MongoDB Access

```bash
# Open MongoDB shell inside container
docker compose exec mongo mongosh

# Inside mongosh:
use devops-academy
db.users.find().pretty()
db.enrollments.find().pretty()
db.reviews.find().pretty()
```

---

## Persistent Data

MongoDB data is stored in a Docker volume `devops_mongo_data`.
It persists across restarts and rebuilds.

```bash
docker volume ls                           # list volumes
docker volume inspect devops_mongo_data   # volume details

# Backup MongoDB data
docker exec devops_mongo mongodump \
  --db devops-academy \
  --out /data/backup

docker cp devops_mongo:/data/backup ./mongo-backup
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Backend exits on start | `docker compose logs backend` — check MONGO_URI |
| MongoDB not ready | Wait 10s — healthcheck retries 5 times |
| Port 80 in use | `sudo lsof -i :80` — stop conflicting service |
| Frontend blank page | `docker compose logs frontend` — check nginx |
| API CORS error | Check `CLIENT_URL` in `backend/.env` |
| Wipe everything and start fresh | `docker compose down -v && docker compose up --build -d` |

---

## Production Notes

- `restart: unless-stopped` keeps containers alive after reboot
- Backend waits for MongoDB healthcheck before starting
- MongoDB data persists in named volume — survives `docker compose down`
- Use `docker compose down -v` only when you want to reset all data
- For production: replace MongoDB container with MongoDB Atlas and remove `mongo` service
- For cloud: push images to ECR/Docker Hub → deploy on EC2/ECS/Kubernetes
