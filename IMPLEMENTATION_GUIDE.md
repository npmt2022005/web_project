# ⚡ Implementation Guide - Step by Step

> Start here! This guide walks you through the entire setup process.

---

## 🎯 Phase 1: Prepare Local Environment (5 minutes)

### Step 1.1: Install Cloudflared

**Windows:**

```powershell
# Open PowerShell as Administrator

# Option A: Using Chocolatey (fastest)
choco install cloudflared -y

# Option B: Using Scoop
scoop install cloudflared

# Option C: Manual download
# 1. Download: https://github.com/cloudflare/cloudflared/releases/download/2024.6.1/cloudflared-windows-amd64.exe
# 2. Rename to: cloudflared.exe
# 3. Place in: C:\Windows\System32\ or add to PATH
# 4. Verify: cloudflared --version

# Verify installation
cloudflared --version
```

**Expected output:**
```
cloudflared version 2024.6.1 (Windows)
```

### Step 1.2: Verify Docker Installation

```powershell
# Check Docker status
docker --version
docker-compose --version
docker ps

# If Docker not running:
# 1. Open Docker Desktop application
# 2. Wait for engine to start (check icon in system tray)
# 3. Retry: docker ps
```

---

## 📝 Phase 2: Configure Environment (5 minutes)

### Step 2.1: Create .env File

```powershell
cd d:\project_ltweb\freelance_marketplace

# Copy template
copy .env.example .env

# Edit .env file (use VS Code or Notepad)
# Fill in your credentials:
#   - Gmail SMTP credentials
#   - Cloudinary API keys
#   - Stripe API keys
```

### Step 2.2: Verify .env

```powershell
# Check if .env was created
Test-Path .env

# View first few lines (don't expose secrets!)
Get-Content .env | Select-Object -First 5
```

---

## 🚀 Phase 3: Start Docker Services (10 minutes)

### Step 3.1: Basic Stack (No Tunnel)

```powershell
cd d:\project_ltweb\freelance_marketplace

# Start all services
docker-compose up -d --build

# Watch logs for 30 seconds
docker-compose logs -f
# Press Ctrl+C to exit logs

# Wait 60 seconds for database initialization...
```

### Step 3.2: Verify Services Are Running

```powershell
# Check container status
docker-compose ps

# Expected output:
# NAME                                  STATUS
# freelance_marketplace_mysql           Up (healthy)
# freelance_marketplace_redis           Up (healthy)
# freelance_marketplace_elasticsearch   Up (healthy)
# freelance_marketplace_backend         Up (healthy)
# freelance_marketplace_frontend        Up (healthy)

# If any show "unhealthy", run:
docker-compose restart <container-name>
# Then wait 30 seconds and check again
```

### Step 3.3: Test Local Access

```powershell
# Open browser or use curl

# Frontend
Start-Process "http://localhost"

# Backend API
Start-Process "http://localhost:8080"

# Swagger API Docs
Start-Process "http://localhost:8080/swagger-ui.html"

# Database check
docker-compose exec mysql mysql -u freelance_user -pfreelance_password -e "SELECT 1;" 
# (Password: freelance_password)
```

---

## 🌐 Phase 4: Setup Cloudflare Tunnel (10 minutes)

### Option A: Quick Tunnel (Instant - No Account)

**Best for: Testing quickly without setup**

```powershell
# Open new PowerShell terminal
# Go to project root
cd d:\project_ltweb\freelance_marketplace

# Create instant tunnel
cloudflared tunnel --url http://localhost

# Terminal will output:
# Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
# https://abc123def456-ghi789.trycloudflare.com

# 🎉 THAT'S YOUR PUBLIC URL!
# Copy the URL and share with your team
```

**Access your app:**
- Frontend: `https://abc123def456-ghi789.trycloudflare.com`
- Backend API: `https://abc123def456-ghi789.trycloudflare.com/api`

**Note:** This URL **changes when you restart** the tunnel. Use Option B for persistent URL.

---

### Option B: Named Tunnel (Persistent - With Account)

**Best for: Production, persistent URLs, custom domain**

#### Step 4B.1: Authenticate with Cloudflare

```powershell
# Authenticate (one-time setup)
cloudflared login

# Browser window will open
# 1. Login to your Cloudflare account
# 2. Select your domain (or create free account at cloudflare.com)
# 3. Click "Authorize" button
# 4. You'll see "Authorization successful"
# 5. Return to PowerShell
```

#### Step 4B.2: Create Named Tunnel

```powershell
# Create named tunnel
cloudflared tunnel create marketplace

# You'll see:
# Created tunnel marketplace with id: 12345678-1234-1234-1234-123456789012

# Get the token for Docker
cloudflared tunnel token marketplace

# You'll see: eyJhbGc...
# Copy this entire value
```

#### Step 4B.3: Add Token to .env

```powershell
# Edit .env and add this line at the end:
CLOUDFLARE_TUNNEL_TOKEN=eyJhbGc...

# Verify it was added
Get-Content .env | Select-String "CLOUDFLARE_TUNNEL_TOKEN"
```

#### Step 4B.4: Start Tunnel in Docker

```powershell
# Stop current tunnel (if running) with Ctrl+C

# Stop old Docker containers
docker-compose down

# Start with tunnel service
docker-compose -f docker-compose.yml -f docker-compose.resilience.yml --profile tunnel up -d

# Check status
docker-compose ps

# View tunnel logs
docker-compose logs cloudflared -f

# You should see "Tunnel ingress created"
```

#### Step 4B.5: Get Tunnel URL

```powershell
# Check tunnel details
cloudflared tunnel info marketplace

# You'll see the tunnel UUID and ingress
# Access at: https://marketplace.tunnels.cloudflare.com (or custom domain)
```

---

## 🔄 Phase 5: Enable Load Balancing & Resilience (5 minutes)

### Step 5.1: Start with Resilience Features

```powershell
# Stop current stack
docker-compose down

# Start with load balancing + second backend instance
docker-compose -f docker-compose.yml -f docker-compose.resilience.yml --profile resilience up -d --build

# Wait 60 seconds for all services to start

# Check all containers
docker-compose ps
```

### Step 5.2: Test Load Balancer

```powershell
# Test load balancer health
curl http://localhost:8081/health

# Expected output:
# healthy

# View Nginx load balancing stats
curl http://localhost:8081/nginx_status
```

### Step 5.3: Test Failover (Optional)

```powershell
# View current connections to backends
curl http://localhost:8081/nginx_status | Select-String "active"

# Stop one backend
docker-compose stop backend

# Traffic should route to backend-replica automatically

# Test API still works
curl http://localhost:8080/api/

# Restart backend
docker-compose start backend
```

---

## 📊 Phase 6: Verification & Testing (5 minutes)

### Step 6.1: Check All Services

```powershell
# Container status
docker-compose ps
# All should show "healthy"

# Resource usage
docker stats
# Note CPU and memory usage

# Network connectivity
docker-compose exec backend curl http://mysql:3306
docker-compose exec backend curl http://redis:6379
```

### Step 6.2: Test from Public URL

```powershell
# Test frontend
Start-Process "https://abc123def456-ghi789.trycloudflare.com"

# Test backend API (should see JSON response)
Invoke-WebRequest -Uri "https://abc123def456-ghi789.trycloudflare.com/api/" -UseBasicParsing | Select-Object StatusCode, Content

# Test Swagger docs
Start-Process "https://abc123def456-ghi789.trycloudflare.com/api/swagger-ui.html"
```

### Step 6.3: Monitor Logs

```powershell
# Follow frontend logs
docker-compose logs -f frontend --tail 20

# Follow backend logs
docker-compose logs -f backend --tail 20

# Check for errors
docker-compose logs backend | Select-String "ERROR|WARN"

# Real-time view of all services
docker-compose logs -f
# Press Ctrl+C to exit
```

---

## 🆘 Phase 7: Troubleshooting Common Issues

### Issue: Docker containers won't start

```powershell
# Check Docker engine
docker ps

# If error, restart Docker Desktop:
# 1. Close Docker Desktop
# 2. Wait 10 seconds
# 3. Reopen Docker Desktop
# 4. Wait for "Docker is running" indicator
# 5. Retry: docker ps

# Check logs
docker-compose logs
```

### Issue: Port 80 already in use

```powershell
# Find what's using port 80
netstat -ano | Select-String ":80 "

# Kill the process (find PID from above)
Stop-Process -Id <PID> -Force

# Or run Docker on different port
# Edit docker-compose.yml, change "80:80" to "8888:80"
# Then access at http://localhost:8888
```

### Issue: Cloudflare tunnel won't connect

```powershell
# Check network connectivity
Test-NetConnection -ComputerName 1.1.1.1 -Port 443

# Verify cloudflared is installed
cloudflared --version

# Check tunnel logs with debug output
cloudflared tunnel run marketplace --loglevel debug

# Common issues:
# - Firewall blocking outbound 443 (HTTPS)
# - VPN blocking Cloudflare
# - DNS resolution issues

# Workaround: Check your firewall/VPN settings
```

### Issue: Backend returning 403 errors

```powershell
# Check backend logs
docker-compose logs backend --tail 30 | Select-String "403|ERROR"

# Check if spring security is blocking requests
docker-compose logs backend --tail 50 | Select-String "SecurityFilter|Authorization"

# Fix: Healthcheck might be failing
# This was already fixed in the updated docker-compose.yml
# Just restart backend:
docker-compose restart backend
```

### Issue: Database connection refused

```powershell
# Check if MySQL is healthy
docker-compose ps | Select-String "mysql"

# Should show: "healthy"
# If not, wait 30 more seconds (MySQL takes time to start)

# Manual database test
docker-compose exec mysql mysql -u freelance_user -pfreelance_password -e "SELECT NOW();"

# If timeout, check MySQL logs
docker-compose logs mysql --tail 50
```

---

## 🎯 Final Checklist

- [ ] ✅ cloudflared installed (`cloudflared --version` works)
- [ ] ✅ .env file created and filled with credentials
- [ ] ✅ All Docker containers running and healthy (`docker-compose ps`)
- [ ] ✅ Frontend accessible at `http://localhost`
- [ ] ✅ Backend API responding (`curl http://localhost:8080/api`)
- [ ] ✅ Cloudflare tunnel connected
- [ ] ✅ Public URL working (`https://abc123...trycloudflare.com`)
- [ ] ✅ Database responding
- [ ] ✅ Redis working
- [ ] ✅ Elasticsearch responsive
- [ ] ✅ Load balancer healthy

---

## 📚 Next Steps

Once everything is running:

1. **Monitor logs regularly:**
   ```powershell
   docker-compose logs -f
   ```

2. **Test new features in backend/frontend**

3. **Share public URL with team:**
   ```
   https://abc123def456-ghi789.trycloudflare.com
   ```

4. **Setup custom domain (optional):**
   - Go to https://dash.cloudflare.com
   - Create CNAME record pointing to tunnel
   - Access at custom domain

5. **Enable monitoring (optional):**
   ```powershell
   docker-compose -f docker-compose.yml -f docker-compose.resilience.yml --profile monitoring up -d
   # Access Portainer at http://localhost:9000
   ```

---

## 🆘 Quick Reference

| Command | Purpose |
|---------|---------|
| `cloudflared tunnel --url http://localhost` | Create instant public URL |
| `cloudflared tunnel create marketplace` | Create persistent tunnel |
| `cloudflared tunnel token marketplace` | Get Docker token |
| `docker-compose up -d` | Start all services |
| `docker-compose ps` | Check container status |
| `docker-compose logs -f backend` | Follow backend logs |
| `docker-compose restart backend` | Restart a service |
| `docker-compose down` | Stop all services |

---

**You're all set! 🚀**

### Having issues?

1. Check the full documentation:
   - [CLOUDFLARE_TUNNEL_SETUP.md](CLOUDFLARE_TUNNEL_SETUP.md)
   - [RESILIENCE_AND_FAILOVER.md](RESILIENCE_AND_FAILOVER.md)

2. Review logs:
   ```powershell
   docker-compose logs -f
   ```

3. Ask for help with specific error messages from logs
