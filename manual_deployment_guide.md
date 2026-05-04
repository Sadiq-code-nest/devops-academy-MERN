# DevOps Academy — PM2 Deployment Guide

**Branch:** `pm2-deployment` · **OS:** Ubuntu 24.04 · **DB:** MongoDB (local)

---

## Prerequisites

- Ubuntu 24.04 server
- Root or sudo access
- Server IP address ready

---

## 1. Install System Tools

```bash
sudo apt update -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm install -g pm2 serve
```

Verify:
```bash
node -v   # v20.x.x
pm2 -v    # version number
```

---

## 2. Install MongoDB

```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb.gpg
echo "deb [signed-by=/usr/share/keyrings/mongodb.gpg] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/7.0 multiverse" > /etc/apt/sources.list.d/mongodb-org.list
apt update && apt install -y mongodb-org
systemctl enable --now mongod
```

Verify:
```bash
systemctl status mongod        # should show: active (running)
ss -tulnp | grep 27017         # should show port listening
```

---

## 3. Clone the Project

```bash
git clone -b pm2-deployment \
  https://github.com/Sadiq-code-nest/devops-academy-MERN.git \
  /var/www/devops-academy

cd /var/www/devops-academy
```

---

## 4. Configure Environment Variables

> ⚠️ Replace `YOUR_SERVER_IP` with your actual server IP (e.g. `172.16.2.188`)

**Backend:**
```bash
vim /var/www/devops-academy/backend/.env
```

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devops-academy
JWT_SECRET=your_long_random_string_here
NODE_ENV=production
CLIENT_URL=http://YOUR_SERVER_IP:4173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@1234
```

**Frontend:**
```bash
vim /var/www/devops-academy/frontend/.env
```

```env
VITE_API_URL=http://YOUR_SERVER_IP:5000/api
```

> `JWT_SECRET` should be a long random string. Generate one:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

---

## 5. Install Dependencies + Test DB

```bash
cd /var/www/devops-academy/backend
npm install

node -e "
require('dotenv').config();
require('mongoose')
  .connect(process.env.MONGO_URI)
  .then(() => { console.log('✅ MongoDB connected'); process.exit(0); })
  .catch(e => { console.log('❌ Failed:', e.message); process.exit(1); });
"
```

Expected: `✅ MongoDB connected`

---

## 6. Seed Admin User

```bash
node seed.js
```

Expected output:
```
✅ MongoDB connected
✅ Test student created
   Email:     student@devopsacademy.com
   Password:  Student@1234
   StudentID: STU-2025-001
✅ Admin credentials (from .env — NOT in database):
   Username:  admin
   Login at:  /adminlogin
```

> Admin is **not stored in MongoDB** — credentials come from `.env` only.

---

## 7. Build Frontend

```bash
cd /var/www/devops-academy/frontend
npm install
npm run build
```

---

## 8. Start Services with PM2

```bash
# Backend
cd /var/www/devops-academy/backend
pm2 start server.js --name devops-backend

# Frontend
cd /var/www/devops-academy/frontend
pm2 serve dist 4173 --name devops-frontend --spa
```

Verify both are running:
```bash
pm2 list
```

Both should show `online`.

---

## 9. Persist on Reboot

```bash
pm2 save
pm2 startup
# Run the command PM2 prints
```

---

## 10. Open Firewall

```bash
sudo ufw allow 22      # SSH
sudo ufw allow 4173    # Frontend
sudo ufw allow 5000    # Backend
sudo ufw enable
```

---

## Access

```
Frontend   →  http://YOUR_SERVER_IP:4173
API Health →  http://YOUR_SERVER_IP:5000/api/health
Login      →  http://YOUR_SERVER_IP:4173/login
Admin      →  http://YOUR_SERVER_IP:4173/adminlogin
```

---

## PM2 Commands

```bash
pm2 list                        # view processes
pm2 logs devops-backend         # live logs
pm2 restart devops-backend --update-env   # restart + reload .env
pm2 stop devops-backend         # stop
pm2 monit                       # live dashboard
```
> Always use `--update-env` when restarting after `.env` changes.
