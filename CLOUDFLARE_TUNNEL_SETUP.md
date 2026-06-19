# 🚀 Cloudflare Tunnel Setup - Freelance Marketplace

## Overview
**Cloudflare Tunnel** provides free public URL + DNS resolution without exposing your local IP. Perfect for testing and development.

---

## 📋 Prerequisites

### Windows Setup
```powershell
# 1. Install Cloudflare CLI (cloudflared)
# Download: https://developers.cloudflare.com/cloudflare-one/connections/connect-applications/install-and-setup/installation/
# Or use chocolatey:
choco install cloudflared

# Verify installation
cloudflared --version
```

### Or Download Direct
- **Download**: https://github.com/cloudflare/cloudflared/releases
- Extract to `C:\Program Files\cloudflared\` and add to PATH

---

## 🔧 Step 1: Authenticate Cloudflare

```powershell
# Authenticate with your Cloudflare account
cloudflared login

# This will:
# 1. Open browser to Cloudflare login
# 2. Ask to authorize cloudflared
# 3. Save cert.pem locally
```

**After authentication**, you'll see cert saved. Keep this safe!

---

## 🌐 Step 2: Create Public Hostname

### Option A: Auto-generated Tunnel URL (Easy)

```powershell
# Quick tunnel (no authentication needed)
cd d:\project_ltweb\freelance_marketplace
cloudflared tunnel --url http://localhost
```

This generates a URL like: `https://xyz-123-abc.trycloudflare.com`

### Option B: Named Tunnel with Subdomain (Professional)

```powershell
# 1. Create named tunnel
cloudflared tunnel create marketplace

# 2. List your domain zones in Cloudflare Dashboard
# https://dash.cloudflare.com/

# 3. Update tunnel configuration (see Step 3 below)

# 4. Start tunnel
cloudflared tunnel run marketplace
```

---

## 📝 Step 3: Configuration Files

### Create `cloudflared-config.yml` in project root:

```yaml
# For named tunnel "marketplace"
tunnel: marketplace
credentials-file: /path/to/credentials/uuid.json

ingress:
  # Frontend on port 80
  - hostname: marketplace.yourdomain.com
    service: http://localhost
    originRequest:
      noTLSVerify: true
      disableChunkedEncoding: true
      timeout: 30s

  # API on port 8080
  - hostname: api.yourdomain.com
    service: http://localhost:8080
    originRequest:
      noTLSVerify: true
      timeout: 30s

  # Catch-all
  - service: http_status:404
```

### Or use with Docker Compose:

Add to `docker-compose.yml`:

```yaml
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: freelance_marketplace_cloudflared
    command: tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    environment:
      - CLOUDFLARE_TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - freelance_network
    restart: unless-stopped
    depends_on:
      - frontend
      - backend
```

---

## 🔐 Step 4: Get Tunnel Token (For Docker)

```powershell
# List your tunnels
cloudflared tunnel list

# Get token for automation (named tunnel only)
cloudflared tunnel token marketplace
```

Add to `.env`:
```
CLOUDFLARE_TUNNEL_TOKEN=eyJhbGc...
```

---

## 🏃 Step 5: Start Tunnel

### Quick Start (Easiest):

```powershell
cd d:\project_ltweb\freelance_marketplace

# This creates instant public URL
cloudflared tunnel --url http://localhost
```

You'll see:
```
Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
https://xyz-abc-123.trycloudflare.com
```

### Named Tunnel (Production):

```powershell
# Terminal 1: Start Docker
docker-compose up -d --build

# Terminal 2: Start cloudflared
cloudflared tunnel run marketplace

# Terminal 3: Monitor
cloudflared tunnel info marketplace
```

---

## 🌍 Step 6: Access Your App

**Frontend**: 
- Local: `http://localhost`
- Public: `https://xyz-abc-123.trycloudflare.com`

**Backend API**:
- Local: `http://localhost:8080`
- Public: `https://xyz-abc-123.trycloudflare.com/api/`

**Swagger Docs**:
- Local: `http://localhost:8080/swagger-ui.html`
- Public: `https://xyz-abc-123.trycloudflare.com/api/swagger-ui.html`

---

## 🔄 DNS Records (For Custom Domain)

If you own a domain on Cloudflare:

```
CNAME Record:
Name: marketplace
Content: abc123.cfargotunnel.com
Proxied: Yes (Orange Cloud)
TTL: Auto
```

Then access at: `https://marketplace.yourdomain.com`

---

## 🛡️ Security Features

Cloudflare Tunnel automatically provides:

✅ **HTTPS/SSL** - Always encrypted  
✅ **DDoS Protection** - Free tier included  
✅ **WAF (Web Application Firewall)** - Free tier  
✅ **No Port Exposure** - Your local IP stays hidden  
✅ **Geographic Routing** - Route by location  

---

## 🆘 Troubleshooting

### Issue: 403 Forbidden
**Cause**: Spring Security blocking requests
**Fix**: 
```properties
# Add to backend/src/main/resources/application.properties
management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=always
# Disable auth for actuator
security.ignored=/actuator/**
```

### Issue: Connection Refused
```powershell
# Check tunnel status
cloudflared tunnel list
cloudflared tunnel info marketplace

# Restart tunnel
cloudflared tunnel run marketplace --loglevel debug
```

### Issue: Slow Connection
```powershell
# Use closest Cloudflare datacenter
# Already automatic, but check with:
nslookup xyz-abc-123.trycloudflare.com
```

---

## 📊 Monitoring

### View Tunnel Analytics:

```powershell
# Real-time logs
cloudflared tunnel run marketplace --loglevel debug

# Or via Cloudflare Dashboard:
# https://dash.cloudflare.com/ → Tunnels → marketplace
```

---

## 🚀 Docker Compose Integration

Complete setup with auto-restart:

```yaml
version: '3.8'

services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: freelance_marketplace_cloudflared
    command: tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    environment:
      - CLOUDFLARE_TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - freelance_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:7844/ready"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 10s
```

---

## 💡 Quick Reference

| Task | Command |
|------|---------|
| Instant tunnel | `cloudflared tunnel --url http://localhost` |
| Create tunnel | `cloudflared tunnel create marketplace` |
| Start tunnel | `cloudflared tunnel run marketplace` |
| List tunnels | `cloudflared tunnel list` |
| Get token | `cloudflared tunnel token marketplace` |
| Check status | `cloudflared tunnel info marketplace` |
| Delete tunnel | `cloudflared tunnel delete marketplace` |

---

## 📌 Next Steps

1. ✅ Install cloudflared
2. ✅ Run quick tunnel (`cloudflared tunnel --url http://localhost`)
3. ✅ Share the URL with team
4. ✅ Fix 403 healthcheck issues (in docker-compose)
5. ✅ Setup named tunnel for persistence
6. ✅ Add to .env and docker-compose
7. ✅ Deploy!

---

**Questions?** Check:
- Cloudflare Docs: https://developers.cloudflare.com/cloudflare-one/
- Troubleshooting: https://developers.cloudflare.com/cloudflare-one/connections/connect-applications/troubleshooting/
