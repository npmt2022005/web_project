# 🐳 Docker Management Quick Reference

**Last Updated**: 2026-06-19  
**Project**: Freelance Marketplace (WebSocket + Chat)

---

## ⚡ Essential Commands

### Start All Services
```bash
cd d:\project_ltweb\freelance_marketplace

# Windows
docker-manage.bat up

# Mac/Linux
./docker-manage.sh up

# Direct Docker Compose
docker-compose up -d
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)
```bash
docker-compose down -v
```

---

## 📊 Monitor Services

### Check All Containers Status
```bash
docker-compose ps
```

### View Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
docker-compose logs -f redis
docker-compose logs -f elasticsearch
```

### Get Last 50 Lines of Logs
```bash
docker-compose logs --tail 50 backend
```

---

## 🔧 Rebuild & Redeploy

### Rebuild All Images
```bash
docker-compose build
```

### Rebuild Specific Image (No Cache)
```bash
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

### Full Redeploy (Clean + Build + Start)
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 🐛 Troubleshooting

### Check Container Health
```bash
docker-compose ps   # Look at STATUS column
```

### Inspect Container Details
```bash
docker inspect freelance_marketplace_backend
docker inspect freelance_marketplace_frontend
```

### Access Container Shell
```bash
# Backend (Java)
docker-compose exec backend /bin/sh

# Frontend (Nginx)
docker-compose exec frontend /bin/sh

# MySQL
docker-compose exec mysql mysql -u freelance_user -p
```

### Reset Specific Service
```bash
# Remove service
docker-compose rm -f backend

# Rebuild and restart
docker-compose build backend
docker-compose up -d backend
```

---

## 🧹 Cleanup Operations

### Remove Unused Docker Resources
```bash
# Remove dangling images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a
```

### Completely Remove Project Containers
```bash
docker-compose down
docker image rm freelance_marketplace-backend freelance_marketplace-frontend
```

---

## 📈 Performance & Debugging

### Monitor Resource Usage
```bash
docker stats
```

### Check Docker System Info
```bash
docker system df
```

### View Network Details
```bash
docker network inspect freelance_network
```

### Check Docker Logs
```bash
docker logs freelance_marketplace_backend --tail 100
docker logs freelance_marketplace_frontend --tail 100
```

---

## 🚀 Development Workflow

### Live Development Changes

#### Backend Code Changes
```bash
# 1. Make code changes in backend/src
# 2. Rebuild image
docker-compose build --no-cache backend

# 3. Restart backend service
docker-compose up -d backend

# 4. Check logs
docker-compose logs -f backend
```

#### Frontend Code Changes
```bash
# 1. Make code changes in frontend/src
# 2. Rebuild frontend assets locally (optional)
npm run build

# 3. Rebuild Docker image
docker-compose build --no-cache frontend

# 4. Restart frontend service
docker-compose up -d frontend

# 5. Check logs
docker-compose logs -f frontend
```

---

## 📊 Service Port Reference

| Service | Port | Type | URL |
|---------|------|------|-----|
| Frontend (Nginx) | 80 | HTTP | http://localhost |
| Backend (Spring Boot) | 8080 | HTTP | http://localhost:8080 |
| MySQL | 3306 | TCP | localhost:3306 |
| Redis | 6379 | TCP | localhost:6379 |
| Elasticsearch | 9200 | HTTP | http://localhost:9200 |

---

## 🔐 Environment Variables

**File**: `.env` (in project root)

```env
# Email Configuration
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_app_password

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret

# Stripe Configuration
STRIPE_API_KEY=sk_test_...
WEB_HOOK_SECRET=whsec_...
```

**To apply new environment variables**:
```bash
# Update .env file
# Restart backend service
docker-compose up -d backend
```

---

## 🌐 Access Services

### Frontend Application
```
http://localhost
```
- Chat page: /chat
- Admin panel: /admin
- Seller marketplace: /marketplace
- Gigs listing: /gigs

### Backend API
```
http://localhost:8080
```
- Swagger/OpenAPI: /swagger-ui.html
- Health check: /actuator/health
- API endpoints: /api/v1/*

### WebSocket Connection
```
ws://localhost:8080/ws
```
- Protocol: STOMP over SockJS
- Auth: JWT token in header
- Topics: /topic/conversation/{id}

### Elasticsearch
```
http://localhost:9200
```
- REST API for search operations
- Index management
- Query execution

---

## 📝 Docker Compose File Structure

```yaml
services:
  mysql:          # Database (MySQL 8.0)
  redis:          # Cache (Redis 7-alpine)
  elasticsearch:  # Search (Elasticsearch 7.17.10)
  backend:        # Spring Boot API (8080)
  frontend:       # React + Nginx (80)

volumes:
  mysql_data:     # Database persistence
  redis_data:     # Cache persistence
  elasticsearch_data: # Search index persistence

networks:
  freelance_network: # Internal bridge network
```

---

## ✅ Health Check Status

All services have health checks configured:

- **Interval**: 30s (check health every 30 seconds)
- **Timeout**: 10s (wait 10 seconds for response)
- **Retries**: 3 (fail after 3 failed checks)
- **Start Period**: 5-40s (grace period before first check)

Check status with:
```bash
docker-compose ps   # STATUS column shows health
```

Expected output for healthy service:
```
Up 5 minutes (healthy)
```

---

## 🔄 Common Workflow Scenarios

### Scenario 1: Backend Changes (Java Code)
```bash
# 1. Edit backend Java files
# 2. Rebuild backend image
docker-compose build --no-cache backend
# 3. Restart service
docker-compose up -d backend
# 4. Check logs
docker-compose logs -f backend
```

### Scenario 2: Frontend Changes (React Code)
```bash
# 1. Edit frontend React files
# 2. Rebuild frontend image
docker-compose build --no-cache frontend
# 3. Restart service
docker-compose up -d frontend
# 4. Clear browser cache (Ctrl+Shift+Delete)
```

### Scenario 3: Database Corruption
```bash
# 1. Stop all services
docker-compose down
# 2. Remove MySQL volume
docker volume rm freelance_marketplace_mysql_data
# 3. Restart services (database will reinitialize)
docker-compose up -d
```

### Scenario 4: Fresh Deployment
```bash
# 1. Clean everything
docker-compose down -v
# 2. Build fresh images
docker-compose build --no-cache
# 3. Start services
docker-compose up -d
# 4. Wait 60 seconds for initialization
# 5. Check services
docker-compose ps
```

---

## 📞 Contact & Notes

- **Git Branch**: test/feature/order_v3
- **Last Deployment**: 2026-06-19
- **Status**: ✅ All services running
- **Next Steps**: Ready for staging/production push

For issues, check:
1. Docker logs: `docker-compose logs [service]`
2. Health status: `docker-compose ps`
3. Port availability: `netstat -an | findstr :8080`

---

**Happy Deploying! 🚀**
