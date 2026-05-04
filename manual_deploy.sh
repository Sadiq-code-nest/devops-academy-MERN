#!/bin/bash
# DevOps Academy — PM2 Deployment
# Usage: chmod +x deploy.sh && sudo ./deploy.sh
set -e

REPO="https://github.com/Sadiq-code-nest/devops-academy-MERN.git"
DIR="/var/www/devops-academy"
IP=$(curl -s ifconfig.me)

# ── Tools ────────────────────────────────────────────────────
apt update -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git
npm install -g pm2 serve

# ── MongoDB ──────────────────────────────────────────────────
# Note: Ubuntu 24.04 (Noble) must use 'jammy' MongoDB repo
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
  gpg --dearmor -o /usr/share/keyrings/mongodb.gpg

echo "deb [signed-by=/usr/share/keyrings/mongodb.gpg arch=amd64,arm64] \
https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
  > /etc/apt/sources.list.d/mongodb-org.list

apt update && apt install -y mongodb-org
systemctl enable --now mongod
sleep 3
systemctl is-active --quiet mongod \
  && echo "✅ MongoDB running" \
  || { echo "❌ mongod failed. Run: systemctl status mongod"; exit 1; }

# ── Clone ────────────────────────────────────────────────────
rm -rf $DIR
git clone -b pm2-deployment $REPO $DIR

# ── Config ───────────────────────────────────────────────────
echo ""
echo "════════════════════════════════"
echo "  Configuration"
echo "════════════════════════════════"
read -p  "Server IP       [${IP}]: " INPUT_IP
read -p  "Admin username  [admin]: " ADMIN_USER
read -sp "Admin password        : " ADMIN_PASS
echo ""

SERVER_IP="${INPUT_IP:-$IP}"
ADMIN_USER="${ADMIN_USER:-admin}"
JWT=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")

# ── .env files ───────────────────────────────────────────────
cat > $DIR/backend/.env <<EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/devops-academy
JWT_SECRET=$JWT
NODE_ENV=production
CLIENT_URL=http://$SERVER_IP:4173
ADMIN_USERNAME=$ADMIN_USER
ADMIN_PASSWORD=$ADMIN_PASS
EOF

cat > $DIR/frontend/.env <<EOF
VITE_API_URL=http://$SERVER_IP:5000/api
EOF

chmod 600 $DIR/backend/.env $DIR/frontend/.env

# ── Test DB ──────────────────────────────────────────────────
cd $DIR/backend && npm install --omit=dev
node -e "
require('dotenv').config();
require('mongoose').connect(process.env.MONGO_URI)
  .then(() => { console.log('✅ MongoDB OK'); process.exit(0); })
  .catch(e => { console.log('❌', e.message); process.exit(1); });
" || { echo "❌ MongoDB connection failed"; exit 1; }

# ── Seed ─────────────────────────────────────────────────────
node seed.js

# ── Frontend build ───────────────────────────────────────────
cd $DIR/frontend && npm install && npm run build

# ── PM2 ──────────────────────────────────────────────────────
pm2 delete all 2>/dev/null || true
pm2 start $DIR/backend/server.js --name devops-backend --cwd $DIR/backend
pm2 serve $DIR/frontend/dist 4173 --name devops-frontend --spa
pm2 save
pm2 startup systemd 2>/dev/null | grep "sudo\|systemctl" | bash || true
pm2 save

# ── Firewall ─────────────────────────────────────────────────
ufw allow 22 && ufw allow 4173 && ufw allow 5000 && ufw --force enable

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "✅ Deployment complete"
echo "──────────────────────────────────────"
echo "  Frontend  →  http://$SERVER_IP:4173"
echo "  API       →  http://$SERVER_IP:5000/api/health"
echo "  Login     →  http://$SERVER_IP:4173/login"
echo "  Admin     →  http://$SERVER_IP:4173/adminlogin"
echo ""
echo "  pm2 list                                 → status"
echo "  pm2 logs devops-backend                  → logs"
echo "  pm2 restart devops-backend --update-env  → after .env change"
