# DevOps Academy

A simple DevOps Academy project built with the MERN stack. This project demonstrates basic deployment practices using modern hosting platforms like Vercel and Netlify.

---

## 🚀 Project Preview

* **Vercel Live:** https://devops-academy-app.vercel.app/
* **Netlify Live:** https://devops-academy-app.netlify.app/

---

## Repository

* **GitHub:** https://github.com/Sadiq-code-nest/devops-academy-MERN.git
* **Branch:** `static-deploy`

---

## 🏗️ Quick Deployment: Ubuntu Server

```bash
wget https://raw.githubusercontent.com/Sadiq-code-nest/devops-academy-MERN/static-deploy/static_deploy.sh
chmod +x static_deploy.sh
./static_deploy.sh
```
---
## ⚙️ Deploy manually

```bash
Step 1 — Install Node.js & Git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
Step 2 — Clone the Project
git clone -b static-deploy \
  https://github.com/Sadiq-code-nest/devops-academy-MERN.git
cd devops-academy-MERN
Step 3 — Serve the Files
npx serve .
# → http://localhost:3000
```
---

## 🛠️ Technologies Used

* React (MERN Stack)
* Node.js
* Express.js
---
