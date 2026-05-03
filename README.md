# DevOps Academy — Docker Deployment

> **Branch:** `docker`
> Demonstrates containerizing the MERN stack using individual Dockerfiles for backend and frontend.

---

## Overview

This branch adds Dockerfiles for both services. Each runs as an independent container.

```
Backend image:   node:20-alpine (multi-stage) → port 5000
Frontend image:  node:20-alpine (build) + nginx:alpine (serve) → port 80
Database:        MongoDB Atlas (external — not containerized here)
```

For a fully containerized setup including MongoDB → use the `docker-compose` branch.

---

## Prerequisites

```bash
docker -v          # Docker 24+
docker buildx version
```

Install Docker:
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## Setup

### 1. Clone

```bash
git clone -b docker https://github.com/your-username/devops-academy.git
cd devops-academy
```

### 2. Create backend .env

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/devops-academy
JWT_SECRET=your_long_random_secret
NODE_ENV=production
CLIENT_URL=http://localhost
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 3. Create frontend .env

```bash
cp frontend/.env.example frontend/.env
nano frontend/.env
```

```env
# Frontend container uses nginx to proxy /api/ to backend container
VITE_API_URL=http://localhost/api
```

---

## Build Images

```bash
# Build backend image
docker build -t devops-backend ./backend

# Build frontend image
docker build -t devops-frontend ./frontend
```

---

## Run

### Create shared network

```bash
docker network create devops-net
```

### Start backend

```bash
docker run -d \
  --name devops-backend \
  --network devops-net \
  --env-file backend/.env \
  -p 5000:5000 \
  devops-backend
```

### Start frontend

```bash
docker run -d \
  --name devops-frontend \
  --network devops-net \
  -p 80:80 \
  devops-frontend
```

---

## Verify

```bash
docker ps                                          # both containers running
curl http://localhost:5000/api/health              # backend direct
curl http://localhost/api/health                   # via nginx proxy
docker logs devops-backend                         # backend logs
docker logs devops-frontend                        # nginx logs
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

## Docker Commands Reference

```bash
docker stop devops-backend devops-frontend         # stop
docker start devops-backend devops-frontend        # start
docker restart devops-backend                      # restart
docker rm -f devops-backend devops-frontend        # remove containers
docker rmi devops-backend devops-frontend          # remove images
docker logs -f devops-backend                      # follow logs
docker exec -it devops-backend sh                  # shell into container
docker stats                                       # live CPU/memory
```

---

## Rebuild After Code Changes

```bash
docker rm -f devops-backend
docker build -t devops-backend ./backend
docker run -d --name devops-backend --network devops-net \
  --env-file backend/.env -p 5000:5000 devops-backend
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Container exits immediately | `docker logs devops-backend` — read error |
| Cannot connect to MongoDB | Check `MONGO_URI` in `backend/.env` |
| Frontend shows blank | Check nginx proxy — `docker logs devops-frontend` |
| Port already in use | `docker rm -f devops-backend` or `lsof -i :5000` |
| API 502 | Backend not in same network — check `docker network ls` |

---

## Production Notes

- Images use `node:20-alpine` — minimal attack surface
- Backend runs as non-root user (`appuser`)
- Frontend served by Nginx — fast static file delivery
- For full orchestration with MongoDB → use `docker-compose` branch
- For Kubernetes → build on this branch's images
