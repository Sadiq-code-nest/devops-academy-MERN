#!/bin/bash
# ============================================================
# DevOps Academy — MERN Deployment WITH Nginx
# Usage: chmod +x deploy-with-nginx.sh && ./deploy-with-nginx.sh
# ============================================================
set -e

# ── CONFIG ───────────────────────────────────────────────────
REPO_URL="https://github.com/your-username/devops-academy.git"
APP_DIR="/var/www/devops-academy"
WEB_ROOT="/var/www/devops-academy-ui"
BACKEND_PORT=5000
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN=${1:-$SERVER_IP}   # pass domain as arg: ./deploy-with-nginx.sh yourdomain.com

# ── SYSTEM ───────────────────────────────────────────────────
echo "→ Updating system..."
sudo apt update -y && sudo apt upgrade -y

echo "→ Installing Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

echo "→ Installing PM2..."
sudo npm install -g pm2

# ── PROJECT ──────────────────────────────────────────────────
echo "→ Cloning project..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
git clone $REPO_URL $APP_DIR
cd $APP_DIR

# ── ENV FILES ────────────────────────────────────────────────
echo "→ Creating .env files..."

cat > backend/.env <<EOF
PORT=$BACKEND_PORT
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/devops-academy
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
NODE_ENV=production
CLIENT_URL=http://$DOMAIN
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisNow@1234
EOF

cat > frontend/.env <<EOF
VITE_API_URL=http://$DOMAIN/api
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

echo "→ Copying build to web root..."
sudo mkdir -p $WEB_ROOT
sudo cp -r dist/* $WEB_ROOT/
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# ── NGINX ────────────────────────────────────────────────────
echo "→ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/devops-academy > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    root $WEB_ROOT;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass         http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host       \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header   X-Real-IP  \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    add_header X-Frame-Options       "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    gzip_min_length 1000;

    location ~* \.(js|css|png|jpg|ico|svg|woff2)$ {
        expires    30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/devops-academy \
            /etc/nginx/sites-enabled/devops-academy

sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t

# ── START NGINX ──────────────────────────────────────────────
echo "→ Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# ── PM2 STARTUP ──────────────────────────────────────────────
echo "→ Configuring PM2 auto-start..."
pm2 startup | tail -1 | bash || true
pm2 save

# ── FIREWALL ─────────────────────────────────────────────────
echo "→ Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny $BACKEND_PORT   # block direct backend access
sudo ufw --force enable

# ── VERIFY ───────────────────────────────────────────────────
echo "→ Verifying deployment..."
sleep 3
sudo nginx -t                                           && echo "✅ Nginx config OK"
curl -sf http://localhost:$BACKEND_PORT/api/health      && echo " ✅ Backend OK"       || echo " ❌ Backend failed"
curl -sf http://localhost/api/health                    && echo " ✅ Nginx proxy OK"   || echo " ❌ Nginx proxy failed"
curl -sf http://localhost | grep -q "html"              && echo " ✅ Frontend OK"      || echo " ❌ Frontend failed"

# ── DONE ─────────────────────────────────────────────────────
echo ""
echo "✅ Deployment complete (WITH Nginx)"
echo "─────────────────────────────────────"
echo "Site      →  http://$DOMAIN"
echo "API       →  http://$DOMAIN/api/health"
echo "Logs      →  pm2 logs devops-backend"
echo "Nginx     →  sudo systemctl status nginx"
echo "Status    →  pm2 list"
echo ""
echo "⚠️  Update MONGO_URI and ADMIN_PASSWORD in:"
echo "    $APP_DIR/backend/.env"
echo "    Then: pm2 restart devops-backend"
echo ""
echo "── Optional: Add HTTPS ───────────────────"
echo "sudo apt install -y certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d $DOMAIN"
