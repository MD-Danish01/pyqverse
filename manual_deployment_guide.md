# Pyqverse Manual Deployment Guide (Azure VM)

## 1. Connect to Azure VM

```bash
ssh azureuser@<VM_IP>
```

---

## 2. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo apt install -y nodejs
```

Verify installation:

```bash
node -v
npm -v
```

---

## 3. Clone Project Repository

```bash
git clone <REPOSITORY_URL>

cd pyqverse
```

---

## 4. Install Dependencies

```bash
npm install
```

or

```bash
npm ci
```

---

## 5. Create Environment File

```bash
nano .env
```

Add all required environment variables:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
...
```

Save and exit.

---

## 6. Build Application

```bash
npm run build
```

### Memory Issue Fix

The build was freezing at:

```text
Creating an optimized production build...
```

on a 1 GB RAM VM.

Created a 2 GB swap file:

```bash
sudo fallocate -l 2G /swapfile

sudo chmod 600 /swapfile

sudo mkswap /swapfile

sudo swapon /swapfile
```

Verify:

```bash
free -h
```

Make swap persistent:

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

After enabling swap, the build completed successfully.

---

## 7. Install PM2

```bash
npm install -g pm2
```

Verify:

```bash
pm2 -v
```

---

## 8. Start Next.js Application

```bash
pm2 start npm --name pyqverse -- start
```

Check status:

```bash
pm2 list
```

Expected status:

```text
online
```

---

## 9. View Logs

```bash
pm2 logs pyqverse
```

---

## 10. Verify Application

```bash
curl http://localhost:3000
```

Application should return HTML.

---

## 11. Configure PM2 Auto Start

Generate startup script:

```bash
pm2 startup
```

Run the command printed by PM2.

Example:

```bash
sudo env PATH=$PATH:/home/azureuser/.nvm/versions/node/v20.x.x/bin pm2 startup systemd -u azureuser --hp /home/azureuser
```

---

## 12. Save PM2 Process List

```bash
pm2 save
```

Verify:

```bash
pm2 list
```

---

## Useful PM2 Commands

Restart app:

```bash
pm2 restart pyqverse
```

Stop app:

```bash
pm2 stop pyqverse
```

Delete app:

```bash
pm2 delete pyqverse
```

View logs:

```bash
pm2 logs pyqverse
```

List running apps:

```bash
pm2 list
```

---

## Deployment Update Process

After new code is pushed to GitHub:

```bash
ssh azureuser@<VM_IP>

cd pyqverse

git pull

npm ci

npm run build

pm2 restart pyqverse
```
