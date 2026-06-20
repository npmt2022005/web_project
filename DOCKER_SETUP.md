# Docker Setup Guide - Freelance Marketplace

## Project Structure

```
freelance_marketplace/
├── backend/                    # Spring Boot Java backend
│   ├── Dockerfile             # Backend Docker image
│   ├── .dockerignore          # Exclude files from Docker build
│   ├── pom.xml
│   ├── src/
│   └── ...
├── frontend/                   # React + Vite frontend
│   ├── Dockerfile             # Frontend Docker image
│   ├── nginx.conf             # Nginx configuration
│   ├── .dockerignore          # Exclude files from Docker build
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── docker-compose.yml         # Orchestration file for all services
├── .env.example               # Environment variables template
└── ...
```

## Services Included

1. **MySQL 8.0** - Database
2. **Redis 7** - Cache & Session storage
3. **Elasticsearch 8.5** - Full-text search
4. **Backend (Spring Boot)** - Port 8080
5. **Frontend (Nginx)** - Port 80

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually bundled with Docker Desktop)
- 8GB RAM minimum for comfortable development
- 20GB disk space for images and data

## Setup Instructions

### Step 1: Clone or Prepare the Project

```bash
cd d:\project_ltweb\freelance_marketplace
```

### Step 2: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

**Example `.env` file:**
```env
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_app_specific_password
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
STRIPE_API_KEY=sk_test_your_stripe_key
WEB_HOOK_SECRET=whsec_your_webhook_secret
```

### Step 3: Build and Run Docker Containers

```bash
# Build all Docker images (first time only)
docker-compose build

# Start all services in background
docker-compose up -d

# View logs of all services
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Step 4: Verify Services

```bash
# Check if all containers are running
docker-compose ps

# Test backend health
curl http://localhost:8080/actuator/health

# Test frontend
# Open browser: http://localhost

# Test MySQL
docker-compose exec mysql mysql -u freelance_user -p freelance_marketplace -e "SELECT 1;"

# Test Redis
docker-compose exec redis redis-cli ping

# Test Elasticsearch
curl http://localhost:9200
```

## Access Points

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost | 80 |
| Backend API | http://localhost:8080 | 8080 |
| MySQL | localhost:3306 | 3306 |
| Redis | localhost:6379 | 6379 |
| Elasticsearch | http://localhost:9200 | 9200 |

## Common Commands

### Development

```bash
# Start all services
docker-compose up

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# Remove all containers and volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild a specific service
docker-compose build backend
docker-compose build frontend

# Restart a service
docker-compose restart backend
```

### View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# View last 100 lines
docker-compose logs --tail 100 backend
```

### Access Container Shell

```bash
# Access backend container
docker-compose exec backend bash

# Access frontend container
docker-compose exec frontend sh

# Access MySQL
docker-compose exec mysql bash
```

## Database Initialization

The MySQL database will be automatically initialized with SQL files from `backend/src/main/resources/db/` on first run.

To manually run initialization scripts:

```bash
docker-compose exec mysql mysql -u freelance_user -p freelance_marketplace < backend/src/main/resources/db/freelance_db_v3.sql
```

## Troubleshooting

### Port Already in Use

```bash
# If port 80, 3306, 8080, etc. are already in use, modify docker-compose.yml
# Change port mappings (e.g., "8081:8080" instead of "8080:8080")
```

### Container Fails to Start

```bash
# Check logs
docker-compose logs backend

# Rebuild the image
docker-compose build --no-cache backend

# Start again
docker-compose up backend
```

### Database Connection Issues

```bash
# Test MySQL connection
docker-compose exec mysql mysql -u freelance_user -p freelance_marketplace -e "SELECT 1;"

# Check MySQL logs
docker-compose logs mysql
```

### Clear Cache and Rebuild

```bash
# Remove everything and start fresh
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

For production, consider:

1. **Environment Variables**: Use secure .env file management
2. **Database Backups**: Set up automated backups for MySQL
3. **SSL/HTTPS**: Add reverse proxy (nginx/traefik) with SSL certificates
4. **Resource Limits**: Set memory/CPU limits in docker-compose.yml
5. **Monitoring**: Implement logging and monitoring solutions
6. **Health Checks**: Already configured in docker-compose.yml
7. **Auto-restart**: Services have `restart: unless-stopped` policy

### Example Production docker-compose.yml additions:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Performance Tuning

### Backend JVM Options
```yaml
environment:
  JAVA_OPTS: "-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"
```

### MySQL Performance
```yaml
command: --max_connections=1000 --default-storage-engine=InnoDB
```

### Redis Memory Policy
```yaml
command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
```

## File Structure After Docker Build

```
freelance_marketplace/
├── mysql_data/               # MySQL data volume
├── redis_data/               # Redis data volume
├── elasticsearch_data/       # Elasticsearch data volume
├── backend/dist/             # Built backend JAR
├── frontend/dist/            # Built frontend files
└── ...
```

## Useful Docker Commands

```bash
# View Docker images
docker images | grep freelance

# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Remove unused images and containers
docker system prune

# View Docker network
docker network ls

# Inspect container details
docker inspect freelance_marketplace_backend
```

## Support & Documentation

- Docker: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Spring Boot: https://spring.io/projects/spring-boot
- React: https://react.dev/
- Nginx: https://nginx.org/

## Next Steps

1. Create `.env` file with your credentials
2. Run `docker-compose build` to build images
3. Run `docker-compose up -d` to start services
4. Verify all services are healthy with `docker-compose ps`
5. Test the application at http://localhost
