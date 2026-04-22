# PART 21 — Manual Deployment Guide (MERN Stack)
# DevOps Academy — Ubuntu Server

This guide covers two deployment approaches:
- Phase 1: Without Nginx (quick, development-style)
- Phase 2: With Nginx (production standard)

Read Phase 1 first. Phase 2 builds on top of it.

---

## 21.1 — Preparation (Common Steps for Both Phases)

### What You Need

```
Item                     Why it is needed
───────────────────────────────────────────────────────────────
Ubuntu 22.04 server      Stable Linux OS — most common in production
Node.js v20              Runs Express backend + builds React frontend
MongoDB (Atlas or local) Stores users, enrollments, reviews
Git                      Clones your project from GitHub
```

---

### Step 1 — Connect to Your Server

```bash
ssh username@your-server-ip
# Example:
ssh ubuntu@192.168.1.100
```

---

### Step 2 — Update the Server

```bash
sudo apt update && sudo apt upgrade -y
```

---

### Step 3 — Install Node.js v20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v    # v20.x.x
npm -v     # 10.x.x
```

---

### Step 4 — Install Git

```bash
sudo apt install -y git
git --version
```

---

### Step 5 — Clone the Project

```bash
cd /var/www
sudo mkdir devops-academy
sudo chown $USER:$USER devops-academy

git clone https://github.com/your-username/devops-academy.git devops-academy
cd devops-academy
```

Your project is now at: `/var/www/devops-academy/`

```
/var/www/devops-academy/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

---

### Step 6 — Create Environment Files

**Backend:**
```bash
cd /var/www/devops-academy/backend
cp .env.example .env
nano .env
```

Fill in:
```env
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/devops-academy
JWT_SECRET=your_long_random_secret_here
NODE_ENV=production
CLIENT_URL=http://your-server-ip
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
```

**Frontend:**
```bash
cd /var/www/devops-academy/frontend
cp .env.example .env
nano .env
```

Fill in:
```env
# Without Nginx: point directly to backend port
VITE_API_URL=http://your-server-ip:5000/api

# With Nginx: point to same domain (Nginx proxies /api internally)
# VITE_API_URL=http://your-server-ip/api
```

Save with `Ctrl+X → Y → Enter`

---

## 21.2 — Deployment WITHOUT Nginx

This is the simplest approach. Backend and frontend run on separate ports.
Good for testing. Not ideal for production — but works.

```
Browser → http://your-ip:4173 (frontend)
                ↓
        React calls API at http://your-ip:5000
                ↓
        Express backend (port 5000)
                ↓
        MongoDB Atlas
```

---

### Step 1 — Install Backend Dependencies

```bash
cd /var/www/devops-academy/backend
npm install
```

---

### Step 2 — Install Frontend Dependencies + Build

```bash
cd /var/www/devops-academy/frontend
npm install
npm run build
```

This creates `/var/www/devops-academy/frontend/dist/`
That folder contains your compiled React app — plain HTML, CSS, JS.

---

### Step 3 — Serve Frontend Build

Install a simple static file server:
```bash
npm install -g serve
```

Run it:
```bash
cd /var/www/devops-academy/frontend
serve -s dist -l 4173 &
```

`&` runs it in the background.

---

### Step 4 — Start Backend

```bash
cd /var/www/devops-academy/backend
node server.js &
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

---

### Step 5 — Open Firewall Ports

```bash
sudo ufw allow 22      # SSH — always keep this open
sudo ufw allow 4173    # Frontend
sudo ufw allow 5000    # Backend API
sudo ufw enable
sudo ufw status
```

---

### Step 6 — Open in Browser

```
Frontend:   http://your-server-ip:4173
Backend:    http://your-server-ip:5000/api/health
```

If both load correctly — your MERN stack is running.

---

### What Is Running and Where

```
Port 4173   →  React frontend (static files served by `serve`)
Port 5000   →  Express backend (Node.js)
Port 27017  →  MongoDB (Atlas: internal, no port needed)
```

---

### Ports and Flow Without Nginx

```
User's Browser
      │
      ├──→ http://server-ip:4173  →  React frontend (serve)
      │         │
      │         └──→ Axios: http://server-ip:5000/api/...
      │                   │
      └──→ http://server-ip:5000  →  Express backend
                          │
                          └──→ MongoDB Atlas
```

---

### Keep Processes Running After Logout

Without a process manager — when you close SSH, both servers stop.

Install PM2 to keep them running:
```bash
npm install -g pm2

# Start backend with PM2
cd /var/www/devops-academy/backend
pm2 start server.js --name devops-backend

# Start frontend with PM2
cd /var/www/devops-academy/frontend
pm2 serve dist 4173 --name devops-frontend --spa

# Save PM2 config (auto-restart on reboot)
pm2 save
pm2 startup
# Run the command PM2 prints
```

PM2 commands:
```bash
pm2 list              # see all running processes
pm2 logs devops-backend  # see backend logs
pm2 restart devops-backend
pm2 stop devops-backend
pm2 delete devops-backend
```

---

## 21.3 — Deployment WITH Nginx

This is the production standard.
Nginx sits in front of everything on port 80.
It routes requests — `/api/` goes to backend, everything else goes to frontend.

```
User's Browser
      │
      └──→ http://server-ip:80  →  Nginx
                  │
                  ├── /          →  frontend dist files
                  └── /api/      →  Express backend :5000
```

Only ONE port (80) is exposed to the internet.
Backend port 5000 stays internal — users cannot reach it directly.

---

### Step 1 — Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
nginx -v
```

---

### Step 2 — Update Frontend .env and Rebuild

Because Nginx now handles routing — the frontend API URL changes:

```bash
nano /var/www/devops-academy/frontend/.env
```

Update to:
```env
VITE_API_URL=http://your-server-ip/api
```

Rebuild the frontend:
```bash
cd /var/www/devops-academy/frontend
npm run build
```

---

### Step 3 — Copy Frontend Build to Web Root

```bash
sudo mkdir -p /var/www/devops-academy-ui
sudo cp -r /var/www/devops-academy/frontend/dist/* /var/www/devops-academy-ui/
```

---

### Step 4 — Configure Nginx

Create a new Nginx config file:
```bash
sudo nano /etc/nginx/sites-available/devops-academy
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name your-server-ip;   # or your domain name

    # ── Frontend — serve React build ──────────────────────
    root /var/www/devops-academy-ui;
    index index.html;

    location / {
        # React Router: all unknown paths → index.html
        try_files $uri $uri/ /index.html;
    }

    # ── Backend API — proxy to Express ────────────────────
    location /api/ {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host       $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header   X-Real-IP  $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # ── Security headers ──────────────────────────────────
    add_header X-Frame-Options       "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    # ── Gzip compression ──────────────────────────────────
    gzip            on;
    gzip_types      text/plain text/css application/javascript application/json;
    gzip_min_length 1000;

    # ── Static asset caching ──────────────────────────────
    location ~* \.(js|css|png|jpg|ico|svg|woff2)$ {
        expires    30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Save with `Ctrl+X → Y → Enter`

---

### Step 5 — Enable the Site

```bash
# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/devops-academy \
           /etc/nginx/sites-enabled/devops-academy

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test config for syntax errors
sudo nginx -t
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

If it fails — read the error, it tells you exactly which line is wrong.

---

### Step 6 — Start Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx    # auto-start on reboot
sudo systemctl status nginx    # should show: active (running)
```

---

### Step 7 — Update Backend CORS

Backend `.env` must list the correct frontend URL.
With Nginx — frontend and backend share the same URL:

```bash
nano /var/www/devops-academy/backend/.env
```

Update:
```env
CLIENT_URL=http://your-server-ip
```

---

### Step 8 — Start Backend with PM2

```bash
cd /var/www/devops-academy/backend
pm2 start server.js --name devops-backend
pm2 save
```

---

### Step 9 — Close Extra Ports

Now that Nginx handles everything on port 80 — close the direct backend port:

```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP via Nginx
sudo ufw deny 5000     # Block direct backend access
sudo ufw deny 4173     # Block old frontend port
sudo ufw reload
sudo ufw status
```

---

### Step 10 — Verify Everything Works

```bash
# Nginx config valid
sudo nginx -t

# Backend running
pm2 list

# Health check via Nginx
curl http://localhost/api/health
# Expected: {"status":"ok"}

# Frontend loads
curl http://localhost
# Expected: HTML of your React app
```

Open browser:
```
http://your-server-ip        → React site
http://your-server-ip/api/health  → {"status":"ok"}
```

---

## 21.4 — Environment Variables in Production

### The Golden Rule

```
.env file is NEVER committed to GitHub.
It is ALWAYS created manually on each server after cloning.
```

---

### Where .env Lives on the Server

```
/var/www/devops-academy/
├── backend/
│   ├── .env          ← created manually, never in Git
│   └── .env.example  ← committed to Git, shows required keys
├── frontend/
│   ├── .env          ← created manually, never in Git
│   └── .env.example  ← committed to Git
```

---

### How to Recreate .env After Cloning

```bash
# Backend
cp /var/www/devops-academy/backend/.env.example \
   /var/www/devops-academy/backend/.env
nano /var/www/devops-academy/backend/.env
# Fill in all values

# Frontend
cp /var/www/devops-academy/frontend/.env.example \
   /var/www/devops-academy/frontend/.env
nano /var/www/devops-academy/frontend/.env
# Fill in VITE_API_URL
```

---

### Frontend .env — Without vs With Nginx

```bash
# WITHOUT Nginx (separate ports)
VITE_API_URL=http://your-server-ip:5000/api

# WITH Nginx (same port, Nginx proxies /api)
VITE_API_URL=http://your-server-ip/api
```

This is the most common mistake developers make when switching
from basic to Nginx deployment. Always rebuild after changing this.

---

### Protect .env File Permissions

```bash
# Only owner can read/write — nobody else
chmod 600 /var/www/devops-academy/backend/.env
chmod 600 /var/www/devops-academy/frontend/.env
```

---

## 21.5 — Full Deployment Flow

### WITHOUT Nginx

```
User's Browser
      │
      ├─ http://server-ip:4173 ──────────────────→ serve (static server)
      │                                                    │
      │                                          React app loads
      │                                                    │
      │              React makes API call                  │
      │  ←────────────────────────────────────────────────┘
      │
      └─ http://server-ip:5000/api/... ──────────→ Express (Node.js)
                                                          │
                                               mongoose.connect()
                                                          │
                                               MongoDB Atlas ──→ data returned
                                                          │
                                               res.json(data)
                                                          │
      React receives response ←────────────────────────────
      Updates UI
```

---

### WITH Nginx

```
User's Browser
      │
      └─ http://server-ip:80 ──────────────────→ Nginx (port 80)
                                                        │
                              ┌─────────────────────────┤
                              │                         │
                    URL path: /                URL path: /api/...
                              │                         │
                    Nginx reads                Nginx proxies to
                    /var/www/devops-academy-ui localhost:5000
                              │                         │
                    Returns index.html        Express backend
                              │                         │
                    React loads in browser    Controller runs
                              │                         │
                    React calls /api/...      Model queries DB
                              │                         │
                    Same request goes         MongoDB Atlas
                    back to Nginx /api/                 │
                              │               Response returned
                    Nginx proxies to          to Nginx
                    Express :5000                       │
                              └─────────────────────────┘
                                             │
                              Response sent to browser
                              React updates UI
```

---

## 21.6 — Common Issues and Fixes

---

### Issue 1 — Port Already in Use

```
Error: EADDRINUSE: address already in use :::5000
```

```bash
# Find what is using port 5000
sudo lsof -i :5000

# Kill it by PID (replace 1234 with actual PID)
sudo kill -9 1234

# Or kill everything on that port
sudo fuser -k 5000/tcp

# Restart backend
pm2 restart devops-backend
```

---

### Issue 2 — MongoDB Connection Failed

```
Error: MongoNetworkError: connect ECONNREFUSED
Error: MongoServerSelectionError: connection timed out
```

```bash
# Check 1: Is MONGO_URI correct in .env?
cat /var/www/devops-academy/backend/.env | grep MONGO

# Check 2: Atlas — is IP whitelisted?
# Go to Atlas → Network Access → Add 0.0.0.0/0

# Check 3: Atlas — is cluster running?
# Atlas dashboard → cluster must show "Active" not "Paused"

# Check 4: Test connection directly
cd /var/www/devops-academy/backend
node -e "
require('dotenv').config();
const m = require('mongoose');
m.connect(process.env.MONGO_URI)
 .then(() => { console.log('Connected'); process.exit(0); })
 .catch(e => { console.log(e.message); process.exit(1); });
"
```

---

### Issue 3 — CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

```bash
# Check backend .env — CLIENT_URL must match frontend URL exactly
nano /var/www/devops-academy/backend/.env

# WITHOUT Nginx:
CLIENT_URL=http://your-server-ip:4173

# WITH Nginx:
CLIENT_URL=http://your-server-ip

# No trailing slash. Exact match.

# Restart backend after changing .env
pm2 restart devops-backend
```

---

### Issue 4 — Nginx 502 Bad Gateway

```
502 Bad Gateway
```

```bash
# 502 means Nginx cannot reach the backend
# Backend is not running on port 5000

# Check if backend is running
pm2 list
# If devops-backend shows "errored" or is missing:
pm2 start /var/www/devops-academy/backend/server.js --name devops-backend

# Check backend logs
pm2 logs devops-backend --lines 30

# Test backend directly (bypass Nginx)
curl http://localhost:5000/api/health
# If this fails → backend is the problem
# If this works → Nginx config is the problem

# Check Nginx config
sudo nginx -t

# Check Nginx is running
sudo systemctl status nginx
```

---

### Issue 5 — Frontend Build Not Loading (Blank Page)

```bash
# Check 1: Does the build exist?
ls /var/www/devops-academy-ui/
# Should show: index.html, assets/, etc.

# If empty — copy build again
sudo cp -r /var/www/devops-academy/frontend/dist/* \
           /var/www/devops-academy-ui/

# Check 2: Nginx root path correct?
sudo nano /etc/nginx/sites-available/devops-academy
# root must point to where you copied the build

# Check 3: File permissions
sudo chmod -R 755 /var/www/devops-academy-ui

# Check 4: Nginx reload
sudo systemctl reload nginx
```

---

### Issue 6 — Frontend API Calls Failing After Nginx Setup

```bash
# Most common cause:
# Frontend .env still has :5000 port — was not updated before rebuild

# Fix:
nano /var/www/devops-academy/frontend/.env
# Change: VITE_API_URL=http://your-ip:5000/api
# To:     VITE_API_URL=http://your-ip/api

# Rebuild
cd /var/www/devops-academy/frontend
npm run build

# Copy new build
sudo cp -r dist/* /var/www/devops-academy-ui/

# Reload Nginx
sudo systemctl reload nginx
```

---

### Issue 7 — Changes Not Showing After Update

```bash
# After any code change:

# 1. Pull latest code
cd /var/www/devops-academy
git pull

# 2. Rebuild frontend (if frontend changed)
cd frontend && npm run build
sudo cp -r dist/* /var/www/devops-academy-ui/
sudo systemctl reload nginx

# 3. Restart backend (if backend changed)
cd ../backend && npm install
pm2 restart devops-backend
```

---

## 21.7 — Final Summary

### Side-by-Side Comparison

```
Feature                  Without Nginx          With Nginx
───────────────────────────────────────────────────────────────
Ports exposed            4173 + 5000            80 only
Setup complexity         Low                    Medium
Production ready         No                     Yes
SSL (HTTPS) support      Difficult              Easy (Certbot)
Static file serving      serve (npm package)    Nginx (optimized)
API proxying             Not needed             /api/ → :5000
Load balancing           No                     Yes (future)
Gzip compression         No                     Yes
Browser caching          No                     Yes
Security                 Basic                  Headers + port isolation
```

---

### When to Use Each

```
Without Nginx:
  ✅ Local testing on a server
  ✅ Quick proof of concept
  ✅ When you just want to verify the app works
  ❌ Not for public production use

With Nginx:
  ✅ Any production deployment
  ✅ When you need a real domain name
  ✅ When you will add HTTPS (SSL)
  ✅ When multiple services share one server
  ✅ Always for professional DevOps setups
```

---

### Why Nginx Is the Production Standard

```
1. Single entry point
   Everything goes through port 80 (or 443 for HTTPS)
   No extra ports exposed to the internet

2. Optimized static file serving
   Nginx serves HTML/CSS/JS files far faster than Node.js
   Node.js is freed to handle only API requests

3. SSL termination
   Add HTTPS in one command with Certbot
   Nginx handles encryption — backend stays simple HTTP

4. Security
   Backend port 5000 is never reachable from outside
   Security headers added in one place

5. Scalability
   Tomorrow you can run 3 backend instances
   Nginx load balances between them — zero code change
```

---

### Add HTTPS (SSL) — One Extra Step After Nginx

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get free SSL certificate (replace with your actual domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (runs twice daily, renews when expiring)
sudo systemctl enable certbot.timer

# Verify renewal works
sudo certbot renew --dry-run
```

After this — your site runs on `https://yourdomain.com`.
Nginx automatically redirects HTTP to HTTPS.

---

### Full Production Checklist

```
Server:
  ✅ Ubuntu 22.04
  ✅ Node.js v20 installed
  ✅ Git installed
  ✅ PM2 installed globally

Project:
  ✅ git clone completed
  ✅ backend/.env created and filled
  ✅ frontend/.env created (VITE_API_URL correct)
  ✅ npm install run in backend/
  ✅ npm run build run in frontend/

Without Nginx only:
  ✅ serve installed globally
  ✅ Both PM2 processes running
  ✅ Ports 4173 + 5000 open in ufw

With Nginx:
  ✅ Nginx installed
  ✅ Frontend build copied to /var/www/devops-academy-ui/
  ✅ Nginx config created and tested (nginx -t)
  ✅ Site enabled in sites-enabled/
  ✅ Default site removed
  ✅ Port 80 open, ports 5000 and 4173 closed
  ✅ PM2 running backend on :5000
  ✅ CLIENT_URL in backend .env matches frontend URL
  ✅ http://server-ip loads the site
  ✅ http://server-ip/api/health returns {"status":"ok"}

Optional (highly recommended):
  ✅ Domain name pointed to server IP
  ✅ Certbot SSL installed
  ✅ https://yourdomain.com works
  ✅ PM2 startup configured (pm2 save && pm2 startup)
```
