# Docker Setup - File Structure & Guide

## 📁 Complete File Structure

```
freelance_marketplace/
│
├── 🐳 DOCKER FILES (Core Infrastructure)
│   ├── docker-compose.yml              ← Main orchestration (all services)
│   ├── docker-compose.override.yml     ← Development overrides
│   ├── .env.example                    ← Environment variables template
│   ├── docker-manage.sh               ← Management script (Mac/Linux)
│   └── docker-manage.bat              ← Management script (Windows)
│
├── 📦 BACKEND (Spring Boot)
│   ├── Dockerfile                     ← Build Java Spring Boot image
│   ├── .dockerignore                  ← Exclude files from Docker
│   ├── pom.xml                        ← Maven dependencies
│   ├── mvnw / mvnw.cmd               ← Maven wrapper
│   └── src/
│       ├── main/
│       │   ├── java/com/thuc_kien/   ← Java source code
│       │   └── resources/
│       │       ├── application.properties ← Spring config
│       │       └── db/
│       │           ├── freelance_db_v2.sql
│       │           ├── freelance_db_v3.sql
│       │           └── freelance_martket_v1.sql
│       └── test/java/                ← Unit tests
│
├── 🎨 FRONTEND (React + Vite)
│   ├── Dockerfile                    ← Build React app image
│   ├── nginx.conf                    ← Nginx web server config
│   ├── .dockerignore                 ← Exclude files from Docker
│   ├── package.json                  ← Node dependencies
│   ├── vite.config.js               ← Vite build config
│   └── src/
│       ├── App.jsx                  ← Root React component
│       ├── main.jsx                 ← Entry point
│       ├── pages/                   ← Page components
│       ├── components/              ← Reusable components
│       ├── services/                ← API services
│       └── assets/                  ← Images, styles, icons
│
├── 📖 DOCUMENTATION (Guides & References)
│   ├── QUICK_START.md               ← 5-minute setup
│   ├── DOCKER_SETUP.md              ← Detailed guide
│   ├── DOCKER_DEPLOYMENT_CHECKLIST.md ← Verification
│   ├── DOCKER_IMPLEMENTATION_SUMMARY.md ← Overview
│   ├── PRODUCTION_DEPLOYMENT.md     ← Server setup
│   └── README.md                    ← Project info
│
├── 🔄 CI/CD PIPELINE
│   └── .github/workflows/
│       └── docker-ci-cd.yml         ← GitHub Actions automation
│
└── 🗂️ DATA VOLUMES (Created at Runtime)
    ├── mysql_data/                  ← MySQL database files
    ├── redis_data/                  ← Redis cache data
    └── elasticsearch_data/          ← Elasticsearch indices
```

## 🎯 File Purposes & Usage

### Core Docker Files

#### 1. **docker-compose.yml** (Main Orchestration)
```yaml
# Defines all 5 services:
# - MySQL (database)
# - Redis (cache)
# - Elasticsearch (search)
# - Backend (Java API)
# - Frontend (React web)

# Usage:
docker-compose up -d      # Start all
docker-compose down       # Stop all
docker-compose logs -f    # View logs
docker-compose ps         # Check status
```

**Key Features**:
- Service dependencies (ensures correct startup order)
- Health checks for reliability
- Volume mounts for data persistence
- Network isolation
- Environment variables management

#### 2. **docker-compose.override.yml** (Development)
```yaml
# Automatically loaded by docker-compose
# Overrides production settings for development

# Includes:
# - Source code volume mounts (hot reload)
# - Debug logging
# - Development environment variables
```

**When Used**: Automatically - no action needed

#### 3. **.env.example** (Configuration Template)
```bash
# Template for environment variables
# Create .env file from this:
# cp .env.example .env

# Required values:
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_app_password
CLOUD_NAME=cloudinary_name
CLOUD_API_KEY=cloudinary_key
STRIPE_API_KEY=stripe_key
```

**Important**: Add `.env` to `.gitignore` (don't commit real credentials)

#### 4. **docker-manage.sh / docker-manage.bat** (Helper Scripts)
```bash
# Bash version (Mac/Linux)
./docker-manage.sh up      # Start
./docker-manage.sh down    # Stop
./docker-manage.sh logs    # View logs
./docker-manage.sh test    # Health check

# Batch version (Windows)
docker-manage.bat up       # Start
docker-manage.bat down     # Stop
docker-manage.bat logs     # View logs
docker-manage.bat test     # Health check
```

### Backend Docker Files

#### 5. **backend/Dockerfile** (Java Container)
```dockerfile
# Stage 1: Build
# - Uses Maven 3.9 + Java 21
# - Downloads dependencies from pom.xml
# - Compiles and packages JAR

# Stage 2: Runtime
# - Uses Alpine Linux for small size (~150MB)
# - Copies compiled JAR
# - Exposes port 8080
# - Includes health checks
```

**Result**: Container running Spring Boot API

#### 6. **backend/.dockerignore**
```
target/          # Don't include build artifacts
.git/           # Don't include git history
node_modules/   # No Node modules needed
.env            # Don't include credentials
```

**Effect**: Reduces build context, faster builds

### Frontend Docker Files

#### 7. **frontend/Dockerfile** (React Container)
```dockerfile
# Stage 1: Build
# - Uses Node 20
# - npm install dependencies
# - npm run build (Vite optimization)

# Stage 2: Runtime
# - Uses Nginx Alpine image
# - Serves React SPA from dist/
# - Proxies /api calls to backend
# - Port 80 (HTTP)
```

**Result**: Container running optimized React app

#### 8. **frontend/nginx.conf** (Web Server Config)
```nginx
# Serves static files (React build)
# Proxies API calls: /api/ → http://backend:8080/
# Configures HTTPS ready
# SPA routing: all requests → index.html
# Gzip compression enabled
```

**Features**:
- 1-year cache for `.js`, `.css`, `.png` files
- API proxy to backend service
- Security headers configured
- Performance optimizations

#### 9. **frontend/.dockerignore**
```
node_modules/   # Build output, not needed
dist/           # Build output, not needed
.git/           # No history needed
.env            # No credentials in image
```

### Documentation Files

#### 10. **QUICK_START.md**
- 5-minute setup guide
- For impatient users
- Windows & Linux instructions
- Basic commands only

**When to Use**: Starting for the first time

#### 11. **DOCKER_SETUP.md**
- Complete reference guide
- 50+ lines of detailed instructions
- Troubleshooting section
- Production considerations

**When to Use**: Need detailed information

#### 12. **DOCKER_DEPLOYMENT_CHECKLIST.md**
- Pre-deployment verification
- All files created/modified
- Architecture diagram
- System requirements

**When to Use**: Before deploying

#### 13. **DOCKER_IMPLEMENTATION_SUMMARY.md**
- Executive summary
- What's been done
- Getting started steps
- Key features overview

**When to Use**: Understanding the setup

#### 14. **PRODUCTION_DEPLOYMENT.md**
- Server setup instructions
- SSL/HTTPS configuration
- Database backup strategy
- Monitoring & scaling
- Security checklist

**When to Use**: Deploying to production

### CI/CD Pipeline

#### 15. **.github/workflows/docker-ci-cd.yml**
```yaml
# Automated testing & deployment
# Triggers on: push to main/develop branches

# Includes:
# - Backend tests (Maven)
# - Frontend tests (ESLint)
# - Docker image builds
# - Push to Docker Hub
# - Optional: Deploy to production
```

**When Used**: Every git push (if configured)

## 🚀 Quick Command Reference

### Start/Stop
```bash
docker-compose up -d          # Start in background
docker-compose down           # Stop all services
docker-compose restart        # Restart all
```

### Manage
```bash
docker-compose ps             # List containers
docker-compose logs -f        # View all logs
docker-compose logs backend   # View backend logs only
```

### Build
```bash
docker-compose build          # Build all images
docker-compose build backend  # Build just backend
docker-compose up --build     # Rebuild and start
```

### Access
```bash
docker-compose exec backend bash              # Shell in backend
docker-compose exec mysql mysql -u freelance_user -p freelance_marketplace
docker-compose exec redis redis-cli
```

### Clean
```bash
docker-compose down           # Stop & remove containers
docker-compose down -v        # Also remove volumes (DELETE DATA!)
docker system prune -a        # Remove unused images
```

## 🔐 Security Best Practices

1. **Credentials**: Store in `.env` file (git ignored)
2. **Passwords**: Use strong, unique passwords
3. **Images**: Don't include secrets in images
4. **Network**: Services isolated in private network
5. **Volumes**: Data encrypted at rest (with disk encryption)
6. **SSL/TLS**: Nginx ready for HTTPS

## 📊 Service Communication

```
Frontend (Nginx:80)
    ↓ HTTP Request
    ↓ /api/users → proxied to backend
    ↓
Backend (Spring Boot:8080)
    ↓ SQL Query
    ↓ SELECT * FROM users
    ↓
MySQL (Database:3306)
    ↓ Result Set
    ↓ User data
    ↓
Backend (Cache check)
    ↓ Redis (Cache:6379)
    ↓ Store/Retrieve cache
    ↓
Elasticsearch (Search:9200)
    ↓ Full-text search
    ↓ Index documents
```

## 💾 Data Persistence

- **MySQL Data**: Stored in `mysql_data/` volume
- **Redis Cache**: Stored in `redis_data/` volume
- **Elasticsearch**: Stored in `elasticsearch_data/` volume
- **Frontend Code**: Built into image (no volume)
- **Backend Code**: Packaged in JAR (no volume)

**Backup**: All volumes can be backed up for disaster recovery

## 🎓 Next: Implementation Checklist

1. [ ] Review this file structure
2. [ ] Open terminal in project root
3. [ ] Copy `.env.example` → `.env`
4. [ ] Edit `.env` with your credentials
5. [ ] Run setup script:
   - Windows: `docker-manage.bat up`
   - Mac/Linux: `./docker-manage.sh up`
6. [ ] Wait 60 seconds for startup
7. [ ] Open browser: http://localhost
8. [ ] View logs: `docker-compose logs -f`

---

**This completes your Docker setup! 🎉**
