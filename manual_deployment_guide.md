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

## 11. Install and Configure Nginx

Install Nginx:

```bash
sudo apt update

sudo apt install -y nginx
```

Allow HTTP traffic through the firewall:

```bash
sudo ufw allow 'Nginx Full'
```

Create a new Nginx site configuration:

```bash
sudo nano /etc/nginx/sites-available/pyqverse
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/pyqverse /etc/nginx/sites-enabled/
```

Remove the default site if desired:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Test the configuration:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

Verify Nginx is running:

```bash
sudo systemctl status nginx
```

Now requests to:

```text
http://<VM_IP>
```

will be forwarded to:

```text
http://localhost:3000
```

where the Next.js application is running.

---

## 12. Configure PM2 Auto Start

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

## 13. Save PM2 Process List

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

## Useful Nginx Commands

Test configuration:

```bash
sudo nginx -t
```

Reload configuration:

```bash
sudo systemctl reload nginx
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

View logs:

```bash
sudo tail -f /var/log/nginx/error.log
```

Check status:

```bash
sudo systemctl status nginx
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

Nginx does not need to be restarted during normal deployments because it continues forwarding traffic from port 80 to the Next.js application running on port 3000.
