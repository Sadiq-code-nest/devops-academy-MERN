#!/bin/bash
# ============================================================
# DevOps Academy — MERN Deployment WITHOUT Nginx
# Usage: chmod +x deploy-without-nginx.sh && ./deploy-without-nginx.sh
# ============================================================
set -e

# ── CONFIG ───────────────────────────────────────────────────
REPO_URL="https://github.com/Sadiq-code-nest/devops-academy-MERN.git"
APP_DIR="/var/www/devops-academy"
FRONTEND_PORT=4173
BACKEND_PORT=5000

# ── SYSTEM ───────────────────────────────────────────────────
echo "→ Updating system..."
sudo apt update -y && sudo apt upgrade -y

echo "→ Installing Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

echo "→ Installing PM2..."
sudo npm install -g pm2 serve

# ── PROJECT ──────────────────────────────────────────────────
echo "→ Cloning project..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
git clone $REPO_URL $APP_DIR
cd $APP_DIR

# ── ENV FILES ────────────────────────────────────────────────
echo "→ Creating .env files..."

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit these manually after script runs if needed
cat > backend/.env <<EOF
PORT=$BACKEND_PORT
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/devops-academy
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
NODE_ENV=production
CLIENT_URL=http://$(curl -s ifconfig.me):$FRONTEND_PORT
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisNow@1234
EOF

cat > frontend/.env <<EOF
VITE_API_URL=http://$(curl -s ifconfig.me):$BACKEND_PORT/api
EOF

# ── BACKEND ──────────────────────────────────────────────────
echo "→ Installing backend dependencies..."
cd $APP_DIR/backend
npm install --omit=dev

echo "→ Seeding admin user..."
node seed.js || echo "Seed skipped (may already exist)"

echo "→ Starting backend with PM2..."
pm2 delete devops-backend 2>/dev/null || true
pm2 start server.js --name devops-backend
pm2 save

# ── FRONTEND ─────────────────────────────────────────────────
echo "→ Installing frontend dependencies..."
cd $APP_DIR/frontend
npm install

echo "→ Building frontend..."
npm run build

echo "→ Serving frontend with PM2..."
pm2 delete devops-frontend 2>/dev/null || true
pm2 serve dist $FRONTEND_PORT --name devops-frontend --spa
pm2 save

# ── PM2 STARTUP ──────────────────────────────────────────────
echo "→ Configuring PM2 auto-start..."
pm2 startup | tail -1 | bash || true
pm2 save

# ── FIREWALL ─────────────────────────────────────────────────
echo "→ Configuring firewall..."
sudo ufw allow 22
sudo ufw allow $FRONTEND_PORT
sudo ufw allow $BACKEND_PORT
sudo ufw --force enable

# ── VERIFY ───────────────────────────────────────────────────
echo "→ Verifying deployment..."
sleep 3
curl -sf http://localhost:$BACKEND_PORT/api/health && echo " ✅ Backend OK" || echo " ❌ Backend failed"

# ── DONE ─────────────────────────────────────────────────────
SERVER_IP=$(curl -s ifconfig.me)
echo ""
echo "✅ Deployment complete (WITHOUT Nginx)"
echo "─────────────────────────────────────"
echo "Frontend  →  http://$SERVER_IP:$FRONTEND_PORT"
echo "Backend   →  http://$SERVER_IP:$BACKEND_PORT/api/health"
echo "Logs      →  pm2 logs"
echo "Status    →  pm2 list"
echo ""
echo "⚠️  Update MONGO_URI and ADMIN_PASSWORD in:"
echo "    $APP_DIR/backend/.env"
echo "    Then run: pm2 restart devops-backend"
