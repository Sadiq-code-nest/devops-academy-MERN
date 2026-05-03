# DevOps Academy — PM2 Deployment

> **Branch:** `pm2-deployment`
> Demonstrates deploying a MERN stack backend using PM2 process manager on a Linux server.

---

## Overview

This branch adds PM2 configuration to keep the Node.js backend running persistently on a server — survives crashes, reboots, and disconnects.

```
Stack:   Node.js (PM2) + React (serve) + MongoDB Atlas
OS:      Ubuntu 22.04
Ports:   5000 (backend) · 4173 (frontend)
```

---

## Prerequisites

```bash
node -v     # v18 or v20
npm -v      # v9 or v10
pm2 -v      # any recent version
```

Install PM2 and serve globally:
```bash
npm install -g pm2 serve
```

---

## Setup

### 1. Clone and install

```bash
git clone -b pm2-deployment https://github.com/your-username/devops-academy.git
cd devops-academy

cd backend  && npm install
cd ../frontend && npm install
```

### 2. Environment files

```bash
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/devops-academy
JWT_SECRET=your_long_random_secret
NODE_ENV=production
CLIENT_URL=http://your-server-ip:4173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://your-server-ip:5000/api
```

### 3. Seed admin user

```bash
cd backend
node seed.js
```

### 4. Build frontend

```bash
cd frontend
npm run build
```

---

## Run

### Start all services

```bash
# Backend via PM2
pm2 start ecosystem.config.js --env production

# Frontend via PM2 static server
pm2 serve frontend/dist 4173 --name devops-frontend --spa

# Save config (auto-restart on reboot)
pm2 save
pm2 startup
# Run the command PM2 prints
```

### PM2 Commands

```bash
pm2 list                          # view all processes
pm2 logs devops-backend           # live backend logs
pm2 logs devops-backend --lines 50 # last 50 lines
pm2 restart devops-backend        # restart backend
pm2 stop devops-backend           # stop backend
pm2 delete devops-backend         # remove from PM2
pm2 monit                         # live CPU/memory dashboard
```

---

## Access

```
Frontend  →  http://your-server-ip:4173
Backend   →  http://your-server-ip:5000/api/health
Login     →  http://your-server-ip:4173/login
Admin     →  http://your-server-ip:4173/adminlogin
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Port 5000 in use | `pm2 delete devops-backend` then restart |
| Backend shows errored | `pm2 logs devops-backend --lines 30` |
| MongoDB failed | Check MONGO_URI in `backend/.env` |
| Registration failing | Verify `CLIENT_URL` matches frontend URL |
| Changes not showing | `pm2 restart devops-backend` |

---

## Production Notes

- PM2 keeps backend alive if it crashes
- `pm2 startup` ensures restart after server reboot
- Logs are saved to `./logs/` directory
- For HTTPS and single-port access → use the `nginx-deployment` branch
- For containerized deployment → use the `docker-compose` branch
