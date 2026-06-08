#!/bin/bash
# @author Sadiq
# @email sadiq@cloudly.io
# ${Version: 1.00}
set -e

echo "🔄 Updating package index..."
sudo apt update

echo "📦 Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

echo "📦 Installing serve globally..."
sudo npm install -g serve

echo "📦 Cloning repository..."
git clone -b static-deploy \
  https://github.com/Sadiq-code-nest/devops-academy-MERN.git
cd devops-academy-MERN

echo "🚀 Starting static server..."
serve . -l 3000 &

echo "🔓 Opening firewall port 3000..."
sudo ufw allow 3000

SERVER_IP=$(curl -s ifconfig.me)
echo ""
echo "✅ Done!"
echo "───────────────────────────────"
echo "  Local   →  http://localhost:3000"
echo "  Network →  http://$SERVER_IP:3000"
