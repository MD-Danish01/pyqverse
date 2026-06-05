# CI/CD Pipeline Documentation

## Overview

Pyqverse uses GitHub Actions for Continuous Integration (CI) and Continuous Deployment (CD).

The deployment target is an Azure Ubuntu VM running:

* Next.js
* PM2
* Nginx
* PostgreSQL

---

## Architecture

```text
Developer
    ↓
git push
    ↓
GitHub Repository
    ↓
CI Workflow
    ↓
Lint
Tests
Production Build
    ↓
CD Workflow
    ↓
SSH into Azure VM
    ↓
git pull
npm ci
npm run build
pm2 restart pyqverse
    ↓
Production Deployment
```

---

# Continuous Integration (CI)

## Trigger

The CI workflow runs on:

* Push to `main`
* Pull Request targeting `main`

```yaml
on:
  push:
    branches: [main]

  pull_request:
    branches: [main]
```

---

## CI Steps

### 1. Checkout Repository

```yaml
- uses: actions/checkout@v4
```

Downloads the repository into the GitHub Actions runner.

---

### 2. Setup Node.js

```yaml
- uses: actions/setup-node@v4
```

Installs the required Node.js version.

---

### 3. Install Dependencies

```yaml
npm ci
```

Installs dependencies using `package-lock.json`.

---

### 4. Run Lint

```yaml
npm run lint
```

Checks code quality and style issues.

---

### 5. Run Tests

```yaml
npm run test
```

Executes automated test suite.

---

### 6. Production Build

```yaml
npm run build
```

Verifies that the application builds successfully for production.

---

## CI Success Criteria

Deployment is allowed only if:

* Dependency installation succeeds
* Lint passes
* Tests pass
* Production build succeeds

---

# Continuous Deployment (CD)

## Trigger

The deployment workflow runs after the CI workflow completes successfully.

```yaml
on:
  workflow_run:
    workflows: ["CI"]
    branches: [main]
    types:
      - completed
```

Deployment is executed only when:

```yaml
if: ${{ github.event.workflow_run.conclusion == 'success' }}
```

---

## Required GitHub Secrets

Repository → Settings → Secrets and Variables → Actions

### VM_HOST

Public IP address of Azure VM.

Example:

```text
20.xxx.xxx.xxx
```

### VM_USER

SSH username.

Example:

```text
azureuser
```

### VM_SSH_KEY

Private SSH key used for authentication.

The corresponding public key must exist in:

```bash
~/.ssh/authorized_keys
```

on the Azure VM.

---

## Deployment Process

GitHub Actions connects to the Azure VM using SSH.

### Navigate to Project

```bash
cd ~/pyqverse
```

---

### Pull Latest Code

```bash
git pull origin main
```

Fetches the latest commit from GitHub.

---

### Install Dependencies

```bash
npm ci
```

Installs dependencies defined in `package-lock.json`.

---

### Build Application

```bash
npm run build
```

Creates the production build.

---

### Restart Application

```bash
pm2 restart pyqverse
```

Reloads the application using the latest build.

First deployment fallback:

```bash
pm2 restart pyqverse || pm2 start npm --name pyqverse -- start
```

This starts the application if it does not already exist in PM2.

---

# PM2 Configuration

Initial server setup:

```bash
pm2 start npm --name pyqverse -- start
pm2 startup
pm2 save
```

After initial configuration, deployments only require:

```bash
pm2 restart pyqverse
```

`pm2 save` is not required during normal deployments.

---

# Manual Deployment Equivalent

The CD workflow automates the following commands:

```bash
ssh azureuser@<VM_IP>

cd ~/pyqverse

git pull origin main

npm ci

npm run build

pm2 restart pyqverse
```

---

# Rollback Strategy

If deployment fails:

```bash
pm2 logs pyqverse
```

Review logs and identify the failing step.

Possible recovery:

```bash
git log --oneline

git checkout <previous_commit>

npm ci

npm run build

pm2 restart pyqverse
```

---

# Future Improvements

* Deploy build artifacts instead of rebuilding on VM
* Add deployment notifications
* Add staging environment
* Add database migration automation
* Add health checks after deployment
* Use Docker-based deployments

```
```
