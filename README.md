# DevOps Academy — Nginx Deployment

> **Branch:** `nginx-deployment`
> Demonstrates deploying a MERN stack with Nginx as reverse proxy — production standard setup.

---

## Overview

This branch adds Nginx configuration to serve the React frontend and proxy API requests to the Express backend through a single port (80).

```
Stack:   Node.js (PM2) + React (Nginx static) + MongoDB Atlas
OS:      Ubuntu 22.04
Ports:   80 (Nginx) — single public entry point
         5000 (backend — internal only, not exposed)
```

```
Browser → Nginx :80
             ├── /        → React static files
             └── /api/    → Express backend :5000
```

---

## Prerequisites

```bash
node -v     # v18 or v20
npm -v      # v9 or v10
nginx -v    # any recent version
pm2 -v      # any recent version
```

Install:
```bash
sudo apt update && sudo apt install -y nginx
npm install -g pm2
```

---

## Setup

### 1. Clone and install

```bash
git clone -b nginx-deployment https://github.com/your-username/devops-academy.git
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
CLIENT_URL=http://your-domain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

Edit `frontend/.env`:
```env
# Nginx proxies /api/ — same domain, no port needed
VITE_API_URL=http://your-domain.com/api
```

### 3. Seed admin user

```bash
cd backend && node seed.js
```

### 4. Build frontend

```bash
cd frontend && npm run build
```

### 5. Copy build to web root

```bash
sudo mkdir -p /var/www/devops-academy-ui
sudo cp -r frontend/dist/* /var/www/devops-academy-ui/
sudo chown -R www-data:www-data /var/www/devops-academy-ui
sudo chmod -R 755 /var/www/devops-academy-ui
```

### 6. Configure Nginx

```bash
# Edit domain name in config first
nano nginx/devops-academy.conf
# Replace: your-domain.com → your actual IP or domain

sudo cp nginx/devops-academy.conf /etc/nginx/sites-available/devops-academy
sudo ln -sf /etc/nginx/sites-available/devops-academy \
            /etc/nginx/sites-enabled/devops-academy
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t          # test config
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Run

### Start backend with PM2

```bash
cd backend
pm2 start server.js --name devops-backend
pm2 save
pm2 startup
# Run the command PM2 prints
```

### Verify

```bash
curl http://localhost:5000/api/health    # backend direct
curl http://localhost/api/health         # via Nginx proxy
curl http://localhost | grep -c html     # frontend
```

---

## Access

```
Site      →  http://your-domain.com
API       →  http://your-domain.com/api/health
Login     →  http://your-domain.com/login
Admin     →  http://your-domain.com/adminlogin
```

---

## Optional: Add HTTPS (Free SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo systemctl enable certbot.timer
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| 502 Bad Gateway | Backend not running — `pm2 start server.js` |
| Blank page | Check web root — `ls /var/www/devops-academy-ui/` |
| API CORS error | Check `CLIENT_URL` in `backend/.env` |
| Nginx config error | `sudo nginx -t` — read the output |
| Changes not live | Rebuild + copy dist, then `sudo systemctl reload nginx` |

---

## Production Notes

- Only port 80 (and 443 for HTTPS) is exposed — port 5000 stays internal
- `sudo ufw deny 5000` after Nginx is working
- Gzip and browser caching are pre-configured in `nginx/devops-academy.conf`
- For containerized deployment → use the `docker-compose` branch
