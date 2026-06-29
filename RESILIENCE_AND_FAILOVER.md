# 🎯 Complete Guide: Cloudflare Tunnel + Resilience + Load Balancing

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Internet (Public)                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Cloudflare Global Network (Free CDN/DDoS/WAF)           │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │  Your Tunnel: xyz-abc-123.trycloudflare.com      │    │   │
│  │  │  or: marketplace.yourdomain.com                  │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Cloudflared Service
                   (Encrypted Tunnel)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Your Local Machine (Windows)                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Nginx Load Balancer (port 80/8081)                       │   │
│  │  - Rate limiting                                          │   │
│  │  - Connection pooling                                     │   │
│  │  - Health checking                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↙                    ↓                    ↖             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  Backend #1    │  │  Backend #2    │  │  Backend #3    │    │
│  │  (port 8080)   │  │  (replica)     │  │  (fallback)    │    │
│  │  ✅ Healthy    │  │  ⏸ Optional   │  │  ❌ Backup     │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│           ↓                    ↓                    ↓             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Shared Resources                            │   │
│  │  ├─ MySQL (port 3306)          [✅ Healthy]             │   │
│  │  ├─ Redis (port 6379)          [✅ Healthy]             │   │
│  │  └─ Elasticsearch (port 9200)  [✅ Healthy]             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Frontend (Nginx + React)                                 │   │
│  │  - Static file serving                                   │   │
│  │  - SPA routing                                           │   │
│  │  - CORS proxy to backend                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Cloudflared

**Windows:**
```powershell
# Option A: Using Chocolatey (if installed)
choco install cloudflared

# Option B: Download direct
# https://github.com/cloudflare/cloudflared/releases
# Download cloudflared-windows-amd64.exe → Add to PATH

# Verify
cloudflared --version
```

### 2. Start Docker Services

```powershell
cd d:\project_ltweb\freelance_marketplace

# Option A: Basic setup (no tunnel yet)
docker-compose up -d --build

# Option B: With resilience (2 backend instances + load balancer)
docker-compose -f docker-compose.yml -f docker-compose.resilience.yml up -d --build

# Option C: With everything (resilience + cloudflare tunnel)
docker-compose --profile resilience --profile tunnel up -d --build
```

### 3. Check Status

```powershell
# View all containers
docker-compose ps

# Check health
docker-compose ps | Select-String "unhealthy|healthy"

# View logs
docker-compose logs -f frontend backend
```

### 4. Create Public Tunnel

```powershell
# Authenticate with Cloudflare (one-time)
cloudflared login

# Start tunnel
cloudflared tunnel --url http://localhost

# ✅ You'll see: https://xyz-abc-123.trycloudflare.com
```

### 5. Access Your App

| Service | Local | Public |
|---------|-------|--------|
| **Frontend** | http://localhost | https://xyz-abc-123.trycloudflare.com |
| **Backend API** | http://localhost:8080 | https://xyz-abc-123.trycloudflare.com/api |
| **Swagger Docs** | http://localhost:8080/swagger-ui.html | https://xyz-abc-123.trycloudflare.com/api/swagger-ui.html |
| **Load Balancer** | http://localhost:8081/health | (Internal only) |

---

## 🔧 Configuration Files

### `.env` - Credentials

```bash
# Copy and fill in your credentials
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
CLOUD_NAME=cloudinary_account
CLOUD_API_KEY=your_key
CLOUD_API_SECRET=your_secret
STRIPE_API_KEY=pk_test_xxx
WEB_HOOK_SECRET=whsec_xxx
CLOUDFLARE_TUNNEL_TOKEN=eyJhbGc...  # For Docker-based tunnel
```

### `docker-compose.yml` - Base Services

Main orchestration file with:
- MySQL database
- Redis cache
- Elasticsearch
- Backend service
- Frontend service

**Key improvements:**
- ✅ Fixed healthchecks (no more 403 errors)
- ✅ Better timeouts and retries
- ✅ Proper dependency ordering
- ✅ Health-based service startup

### `docker-compose.resilience.yml` - Resilience Features

Add with: `docker-compose -f docker-compose.yml -f docker-compose.resilience.yml up -d`

Services:
- **Nginx Load Balancer** - Distributes traffic
- **Backend Replica** - Second instance (optional)
- **Cloudflare Tunnel** - Public URL (optional)
- **Portainer** - Container monitoring (optional)

### `nginx-lb.conf` - Load Balancer Config

Features:
- ✅ **Upstream pooling** - Multiple backends
- ✅ **Rate limiting** - API: 100r/s, General: 50r/s
- ✅ **Connection pooling** - Keepalive=32
- ✅ **Health checks** - Auto-remove unhealthy backends
- ✅ **CORS support** - Pre-configured
- ✅ **WebSocket** - Full support
- ✅ **Gzip compression** - Reduces bandwidth
- ✅ **Buffering** - Better performance

---

## 🎯 Deployment Scenarios

### Scenario 1: Quick Testing (Minimal)

```powershell
# Start basic stack
docker-compose up -d --build

# Quick tunnel (instant URL)
cloudflared tunnel --url http://localhost

# Access: https://xyz-abc-123.trycloudflare.com
```

**Pros:**
- ✅ Simple, instant
- ✅ No configuration needed

**Cons:**
- ❌ URL changes on restart
- ❌ Single backend
- ❌ No resilience

---

### Scenario 2: Production-Ready (Recommended)

```powershell
# Setup named tunnel first
cloudflared tunnel create marketplace
cloudflared tunnel token marketplace  # Copy this

# Add to .env
echo "CLOUDFLARE_TUNNEL_TOKEN=eyJhbGc..." >> .env

# Start full stack
docker-compose -f docker-compose.yml -f docker-compose.resilience.yml --profile resilience --profile tunnel up -d --build

# Check status
docker-compose ps
docker-compose logs -f cloudflared
```

**Pros:**
- ✅ Persistent URL
- ✅ Multiple backends
- ✅ Load balancing
- ✅ Auto-failover
- ✅ Better resilience

**Cons:**
- ⚠️ More setup
- ⚠️ Higher resource usage

---

### Scenario 3: Development with Monitoring

```powershell
# All services + monitoring dashboard
docker-compose -f docker-compose.yml -f docker-compose.resilience.yml --profile resilience --profile tunnel --profile monitoring up -d --build

# Access Portainer (container management):
# http://localhost:9000
```

---

## 📈 Resilience & Failover Features

### 1. **Health Checks**

Each service has healthchecks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/api/ || exit 1"]
  interval: 30s        # Check every 30 seconds
  timeout: 15s         # Wait 15s for response
  retries: 5           # Mark unhealthy after 5 failures
  start_period: 60s    # Grace period before checks start
```

Docker automatically:
- ❌ Stops unhealthy containers
- 🔄 Restarts them
- 🚀 Notifies downstream services

### 2. **Load Balancing**

Nginx upstream config:

```nginx
upstream backend_pool {
    server backend:8080 weight=10 max_fails=3 fail_timeout=30s;
    server backend-replica:8080 weight=10 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:9999 backup;  # Fallback
}
```

Behavior:
- 🔀 Round-robin between healthy backends
- ⏸ Removes backend after 3 failures
- 🔄 Retries after 30 seconds
- 🆘 Falls back if all primary backends down

### 3. **Rate Limiting**

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
```

- 🛡️ Protects backend from abuse
- 📊 Burst allowance: 200 requests
- ⚙️ Separate limits for API vs. general traffic

### 4. **Connection Pooling**

```nginx
upstream backend_pool {
    keepalive 32;  # Reuse connections
}
```

Benefits:
- ⚡ 50-70% faster responses
- 📉 Lower backend CPU usage
- 🔗 Fewer connection timeouts

### 5. **Restart Policies**

```yaml
restart: on-failure:5  # Restart up to 5 times on failure
restart: unless-stopped  # Always restart except manual stop
```

---

## 🌐 Cloudflare Tunnel Integration

### Quick Tunnel (No Account)

```powershell
cloudflared tunnel --url http://localhost
```

Output:
```
Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
https://xyz-abc-123.trycloudflare.com
```

✅ Instant, ❌ Changes on restart

---

### Named Tunnel (With Account)

```powershell
# 1. Create tunnel
cloudflared tunnel create marketplace

# 2. Get token for Docker
cloudflared tunnel token marketplace
# Copy: eyJhbGc...

# 3. Add to .env
CLOUDFLARE_TUNNEL_TOKEN=eyJhbGc...

# 4. Start with tunnel
docker-compose --profile tunnel up -d

# 5. View tunnel info
cloudflared tunnel info marketplace

# 6. Configure custom domain (optional)
# In Cloudflare Dashboard:
# DNS → CNAME: marketplace.yourdomain.com → abc123.cfargotunnel.com
```

✅ Persistent URL, ✅ Custom domain support

---

## 🆘 Troubleshooting

### Issue: Frontend/Backend Unhealthy

```powershell
# Check logs
docker-compose logs backend --tail 20
docker-compose logs frontend --tail 20

# Inspect health details
docker inspect freelance_marketplace_backend --format='{{json .State.Health}}'

# Force restart
docker-compose restart backend frontend
```

### Issue: Tunnel Connection Failed

```powershell
# Check tunnel status
cloudflared tunnel list
cloudflared tunnel info marketplace

# View logs with debug
cloudflared tunnel run marketplace --loglevel debug

# Check network
ping 1.1.1.1
nslookup xyz-abc-123.trycloudflare.com
```

### Issue: High CPU Usage

```powershell
# Check resource usage
docker stats

# Reduce Java heap
# Edit docker-compose.yml backend environment:
# JAVA_OPTS: "-XX:+UseG1GC -XX:MaxRAMPercentage=50.0"

# Restart
docker-compose restart backend
```

### Issue: Slow Response Times

```powershell
# Enable load balancer monitoring
docker logs freelance_marketplace_loadbalancer --tail 20

# Check connection pool status
curl http://localhost:8081/nginx_status

# Increase worker processes (edit nginx-lb.conf)
worker_processes auto;  # or specific number
```

---

## 📊 Monitoring Commands

```powershell
# View all container status
docker-compose ps

# Real-time resource monitoring
docker stats

# View service logs (follow mode)
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f cloudflared

# Extract errors
docker-compose logs backend | Select-String "ERROR|WARN"

# Check network connectivity
docker-compose exec backend curl http://mysql:3306
docker-compose exec backend curl http://redis:6379

# Database connection test
docker-compose exec mysql mysql -u freelance_user -p -e "SELECT 1;"
# Password: freelance_password

# Redis connection test
docker-compose exec redis redis-cli ping

# Elasticsearch test
curl http://localhost:9200/
```

---

## 🔄 Managing Containers

```powershell
# Start all services
docker-compose up -d

# Start with profiles
docker-compose --profile resilience up -d
docker-compose --profile tunnel up -d
docker-compose --profile monitoring up -d

# Stop all
docker-compose down

# Remove everything (including data!)
docker-compose down -v

# View logs
docker-compose logs service_name -f

# Execute command in container
docker-compose exec backend curl http://localhost:8080

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose up -d backend

# View resource usage
docker stats

# Prune unused containers/images/volumes
docker system prune -a --volumes
```

---

## 📚 File Structure

```
freelance_marketplace/
├── docker-compose.yml              # Main services
├── docker-compose.resilience.yml   # Load balancing + replicas
├── nginx-lb.conf                   # Load balancer configuration
├── CLOUDFLARE_TUNNEL_SETUP.md      # Tunnel documentation
├── RESILIENCE_AND_FAILOVER.md      # This file
├── .env                            # Credentials (don't commit!)
├── .env.example                    # Template
│
├── backend/
│   ├── Dockerfile
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│
└── (other config files)
```

---

## 💡 Best Practices

### Security

- ✅ Never commit `.env` file
- ✅ Use strong passwords for MySQL/Redis
- ✅ Enable Cloudflare WAF (Web Application Firewall)
- ✅ Use HTTPS only (Cloudflare provides this)
- ✅ Regular security updates for Docker images

### Performance

- ✅ Use load balancing for multiple backends
- ✅ Enable connection pooling
- ✅ Configure appropriate timeouts
- ✅ Monitor resource usage (docker stats)
- ✅ Use gzip compression

### Reliability

- ✅ Configure health checks for all services
- ✅ Use restart policies
- ✅ Implement rate limiting
- ✅ Monitor logs regularly
- ✅ Test failover scenarios

### Maintenance

- ✅ Keep Docker images updated
- ✅ Backup database regularly
- ✅ Monitor tunnel status
- ✅ Archive old logs
- ✅ Document custom configurations

---

## 🎓 Learning Resources

| Topic | Resource |
|-------|----------|
| Cloudflare Tunnel | https://developers.cloudflare.com/cloudflare-one/connections/connect-applications/ |
| Docker Compose | https://docs.docker.com/compose/ |
| Nginx Load Balancing | https://nginx.org/en/docs/http/load_balancing.html |
| Spring Boot Health Checks | https://spring.io/guides/gs/spring-boot-docker/ |
| Docker Healthchecks | https://docs.docker.com/engine/reference/builder/#healthcheck |

---

## ✅ Verification Checklist

After setup:

- [ ] All containers healthy: `docker-compose ps`
- [ ] Frontend accessible: `http://localhost`
- [ ] Backend API working: `curl http://localhost:8080/api/`
- [ ] Database connected: `docker-compose exec mysql mysql -u freelance_user -pfreelance_password -e "SELECT 1;"`
- [ ] Redis working: `docker-compose exec redis redis-cli ping`
- [ ] Elasticsearch responsive: `curl http://localhost:9200`
- [ ] Tunnel public URL working: `curl https://xyz-abc-123.trycloudflare.com`
- [ ] Load balancer healthy: `curl http://localhost:8081/health`
- [ ] All logs clean: `docker-compose logs | grep ERROR` (should be empty)

---

## 🚀 Next Steps

1. ✅ Setup Cloudflare Tunnel (see CLOUDFLARE_TUNNEL_SETUP.md)
2. ✅ Start containers with resilience
3. ✅ Monitor health status
4. ✅ Test failover (stop a backend, watch recovery)
5. ✅ Configure custom domain (optional)
6. ✅ Setup monitoring dashboard (Portainer)
7. ✅ Configure alerting/logging
8. ✅ Document production credentials securely

---

**Questions?** Check the logs: `docker-compose logs -f`
