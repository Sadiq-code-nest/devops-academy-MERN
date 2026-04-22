#!/bin/bash
# ============================================================
# DevOps Academy — MERN Deployment WITHOUT Nginx (Fixed)
# Usage: chmod +x deploy-without-nginx.sh && ./deploy-without-nginx.sh
# ============================================================
set -e

# ── CONFIG ───────────────────────────────────────────────────
REPO_URL="https://github.com/Sadiq-code-nest/devops-academy-MERN.git"
APP_DIR="/var/www/devops-academy"
FRONTEND_PORT=4173
BACKEND_PORT=5000
SERVER_IP=$(curl -s ifconfig.me)

# ── SYSTEM ───────────────────────────────────────────────────
echo "→ Updating system..."
sudo apt update -y && sudo apt upgrade -y

echo "→ Installing Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

echo "→ Installing PM2 + serve..."
sudo npm install -g pm2 serve

# ── KILL EXISTING PROCESSES ──────────────────────────────────
echo "→ Cleaning up existing processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sleep 2

PORT_PID=$(lsof -ti :$BACKEND_PORT 2>/dev/null) && kill -9 $PORT_PID 2>/dev/null || true
PORT_PID=$(lsof -ti :$FRONTEND_PORT 2>/dev/null) && kill -9 $PORT_PID 2>/dev/null || true
sleep 1

if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
  echo "❌ Port $BACKEND_PORT still in use. Exiting."
  exit 1
fi
echo "✅ Ports are free"

# ── PROJECT ──────────────────────────────────────────────────
echo "→ Cloning project..."
sudo rm -rf $APP_DIR
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
git clone $REPO_URL $APP_DIR
cd $APP_DIR

# ── COLLECT REAL VALUES ──────────────────────────────────────
echo ""
echo "══════════════════════════════════════"
echo " CONFIGURATION — Enter real values"
echo "══════════════════════════════════════"

read -p "MongoDB Atlas URI: " MONGO_URI
read -p "Admin username:    " ADMIN_USER
read -s -p "Admin password:    " ADMIN_PASS
echo ""

if [ -z "$MONGO_URI" ]; then
  echo "❌ MONGO_URI cannot be empty. Exiting."
  exit 1
fi

# ── TEST DB BEFORE CONTINUING ────────────────────────────────
echo "→ Testing MongoDB connection..."
cd $APP_DIR/backend
npm install --omit=dev --silent

node -e "
const m = require('mongoose');
m.connect('$MONGO_URI')
 .then(() => { console.log('✅ MongoDB connected'); process.exit(0); })
 .catch(e => { console.log('❌ MongoDB failed:', e.message); process.exit(1); });
" || {
  echo ""
  echo "❌ MongoDB connection failed."
  echo "   Fix your Atlas URI or whitelist your IP, then re-run."
  exit 1
}

# ── ENV FILES ────────────────────────────────────────────────
echo "→ Writing .env files..."

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

cat > $APP_DIR/backend/.env <<EOF
PORT=$BACKEND_PORT
MONGO_URI=$MONGO_URI
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
CLIENT_URL=http://$SERVER_IP:$FRONTEND_PORT
ADMIN_USERNAME=$ADMIN_USER
ADMIN_PASSWORD=$ADMIN_PASS
EOF

cat > $APP_DIR/frontend/.env <<EOF
VITE_API_URL=http://$SERVER_IP:$BACKEND_PORT/api
EOF

chmod 600 $APP_DIR/backend/.env
chmod 600 $APP_DIR/frontend/.env

# ── SEED ─────────────────────────────────────────────────────
echo "→ Seeding admin user..."
cd $APP_DIR/backend
node seed.js && echo "✅ Admin seeded" || echo "⚠️  Seed skipped (may already exist)"

# ── START BACKEND ────────────────────────────────────────────
echo "→ Starting backend with PM2..."
pm2 start server.js --name devops-backend
sleep 3

if ! pm2 list | grep -q "devops-backend.*online"; then
  echo "❌ Backend failed to start."
  pm2 logs devops-backend --lines 20 --nostream
  exit 1
fi
echo "✅ Backend running"

# ── BUILD + SERVE FRONTEND ───────────────────────────────────
echo "→ Installing frontend dependencies..."
cd $APP_DIR/frontend
npm install --silent

echo "→ Building frontend..."
npm run build

echo "→ Serving frontend with PM2..."
pm2 serve dist $FRONTEND_PORT --name devops-frontend --spa
sleep 2
echo "✅ Frontend running"

# ── PM2 STARTUP ──────────────────────────────────────────────
echo "→ Saving PM2 config..."
pm2 save
pm2 startup systemd -u $USER --hp $HOME 2>/dev/null | grep "sudo" | bash || true
pm2 save

# ── FIREWALL ─────────────────────────────────────────────────
echo "→ Configuring firewall..."
sudo ufw allow 22
sudo ufw allow $FRONTEND_PORT
sudo ufw allow $BACKEND_PORT
sudo ufw --force enable

# ── FINAL VERIFY ─────────────────────────────────────────────
echo ""
echo "→ Running verification..."
sleep 2

curl -sf http://localhost:$BACKEND_PORT/api/health \
  && echo "✅ Backend API OK" \
  || echo "❌ Backend API failed — run: pm2 logs devops-backend"

REG_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:$BACKEND_PORT/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"HealthCheck","email":"hc@hc.com","password":"123456","studentId":"HC-001"}')

if [ "$REG_TEST" = "201" ] || [ "$REG_TEST" = "409" ]; then
  echo "✅ Registration endpoint OK (HTTP $REG_TEST)"
else
  echo "❌ Registration returned HTTP $REG_TEST"
  echo "   Run: pm2 logs devops-backend --lines 30"
fi

pm2 list

# ── DONE ─────────────────────────────────────────────────────
echo ""
echo "✅ Deployment complete (WITHOUT Nginx)"
echo "─────────────────────────────────────────────"
echo "Frontend   →  http://$SERVER_IP:$FRONTEND_PORT"
echo "Backend    →  http://$SERVER_IP:$BACKEND_PORT/api/health"
echo "PM2 logs   →  pm2 logs devops-backend"
echo "PM2 status →  pm2 list"
