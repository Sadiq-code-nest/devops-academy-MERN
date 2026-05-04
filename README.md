# DevOps Academy: PM2 deployment

A full-stack DevOps course platform built with MongoDB, Express, React, and Node.js.

---

## Quick Deploy — Ubuntu Server

### Automated (Recommended)

```bash
wget -O manual_deploy.sh https://raw.githubusercontent.com/Sadiq-code-nest/devops-academy-MERN/pm2-deployment/manual_deploy.sh
chmod +x manual_deploy.sh
sudo ./manual_deploy.sh
```

Script handles everything — Node.js, MongoDB, environment setup, build, PM2, firewall.
Prompts for 3 values: server IP, admin username, admin password.

### Manual

```bash
# 1. Install tools
apt update -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git && npm install -g pm2 serve

# 2. Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb.gpg
echo "deb [signed-by=/usr/share/keyrings/mongodb.gpg arch=amd64,arm64] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" > /etc/apt/sources.list.d/mongodb-org.list
apt update && apt install -y mongodb-org && systemctl enable --now mongod

# 3. Clone
git clone -b pm2-deployment https://github.com/Sadiq-code-nest/devops-academy-MERN.git /var/www/devops-academy
cd /var/www/devops-academy

# 4. Environment (replace YOUR_IP)
cat > backend/.env <<EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/devops-academy
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
NODE_ENV=production
CLIENT_URL=http://YOUR_IP:4173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
EOF

echo "VITE_API_URL=http://YOUR_IP:5000/api" > frontend/.env
chmod 600 backend/.env

# 5. Install, seed, build
cd backend && npm install && node seed.js
cd ../frontend && npm install && npm run build

# 6. Start with PM2
pm2 start /var/www/devops-academy/backend/server.js --name devops-backend --cwd /var/www/devops-academy/backend
pm2 serve /var/www/devops-academy/frontend/dist 4173 --name devops-frontend --spa
pm2 save && pm2 startup
```

---

## Access

| | URL |
|---|---|
| Frontend | `http://YOUR_IP:4173` |
| API | `http://YOUR_IP:5000/api/health` |
| Student Login | `http://YOUR_IP:4173/login` |
| Admin Login | `http://YOUR_IP:4173/adminlogin` |

---

## Tech Stack

`React 18` · `Vite` · `Node.js` · `Express` · `MongoDB` · `Mongoose` · `JWT` · `PM2`
