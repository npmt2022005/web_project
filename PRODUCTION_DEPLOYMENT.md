# Production Deployment Guide

## 🏭 Production Deployment

This guide covers deploying the Freelance Marketplace to a production environment using Docker.

## Prerequisites

- Ubuntu 22.04 LTS or similar Linux distribution
- Docker & Docker Compose installed
- Domain name (e.g., freelance.example.com)
- SSL Certificate (Let's Encrypt recommended)
- 4GB RAM minimum
- 50GB disk space

## Server Setup

### 1. Install Docker & Docker Compose

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone Repository

```bash
sudo mkdir -p /opt/freelance-marketplace
cd /opt/freelance-marketplace
git clone <your-repo-url> .
```

### 3. Setup Environment

```bash
# Create .env file with production values
sudo cp .env.example .env
sudo nano .env

# Make sure to add:
# - Strong database passwords
# - Real Stripe API keys
# - Real Gmail/SMTP credentials
# - Real Cloudinary credentials
```

### 4. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y

# Create SSL certificate
sudo certbot certonly --standalone -d freelance.example.com

# Certificate location: /etc/letsencrypt/live/freelance.example.com/
```

### 5. Create Production docker-compose.yml

```bash
# Create a separate production docker-compose.yml
cp docker-compose.yml docker-compose.prod.yml
nano docker-compose.prod.yml
```

Update `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: yourusername/freelance-marketplace-backend:latest
    restart: always
    environment:
      # All production environment variables
      SPRING_PROFILES_ACTIVE: prod
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 60s
      timeout: 10s
      retries: 3

  frontend:
    image: yourusername/freelance-marketplace-frontend:latest
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
      # Mount nginx config with SSL
      - ./nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend

  # ... other services (mysql, redis, elasticsearch)
```

### 6. Create Production Nginx Config

Create `nginx.prod.conf`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name freelance.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name freelance.example.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/freelance.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/freelance.example.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    client_max_body_size 20M;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
```

### 7. Database Backup Strategy

```bash
# Create backup script: backup-db.sh
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mysql mysqldump -u freelance_user -p$DB_PASSWORD freelance_marketplace > backups/db_$TIMESTAMP.sql

# Make it executable
chmod +x backup-db.sh

# Add to crontab for daily backups
# 0 2 * * * cd /opt/freelance-marketplace && ./backup-db.sh
```

### 8. Start Production Services

```bash
# Set environment
export COMPOSE_FILE=docker-compose.prod.yml

# Build images (optional, if not using pre-built images)
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify health
docker-compose ps
```

### 9. SSL Certificate Auto-Renewal

```bash
# Create renewal script: renew-ssl.sh
#!/bin/bash
certbot renew --quiet
docker-compose -f docker-compose.prod.yml exec frontend nginx -s reload

# Make it executable
chmod +x renew-ssl.sh

# Add to crontab
# 0 3 * * * /opt/freelance-marketplace/renew-ssl.sh
```

## Monitoring & Maintenance

### Docker Container Monitoring

```bash
# View resource usage
docker stats

# View logs with timestamps
docker-compose logs -f --timestamps

# Monitor specific service
docker-compose logs -f backend
```

### Set Up Auto-Restart

```bash
# Create systemd service: /etc/systemd/system/freelance-marketplace.service
[Unit]
Description=Freelance Marketplace Docker Services
After=docker.service
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/opt/freelance-marketplace
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up
ExecStop=/usr/bin/docker-compose down
Restart=unless-stopped
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable freelance-marketplace
sudo systemctl start freelance-marketplace
sudo systemctl status freelance-marketplace
```

## Backup & Disaster Recovery

### Automated Database Backups

```bash
#!/bin/bash
# backup-all.sh
BACKUP_DIR=/backups/freelance-marketplace
mkdir -p $BACKUP_DIR

# MySQL backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mysql mysqldump \
  -u freelance_user -p$MYSQL_PASSWORD \
  freelance_marketplace > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR s3://your-bucket/backups/
```

### Restore from Backup

```bash
# Extract backup
gunzip backup.sql.gz

# Restore
docker-compose exec -T mysql mysql -u freelance_user -p$MYSQL_PASSWORD freelance_marketplace < backup.sql
```

## Performance Optimization

### Database Optimization

```sql
-- Create indexes for better query performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_gig_seller ON gigs(seller_id);
CREATE INDEX idx_order_buyer ON orders(buyer_id);
CREATE INDEX idx_order_seller ON orders(seller_id);
```

### Redis Cache Configuration

```yaml
redis:
  command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Java Heap Size Tuning

```yaml
backend:
  environment:
    JAVA_OPTS: "-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0"
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable firewall (UFW)
- [ ] Setup fail2ban for brute-force protection
- [ ] Enable SSH key authentication only
- [ ] Regular security updates
- [ ] HTTPS/SSL enabled
- [ ] Database encryption at rest
- [ ] Backup encrypted and stored safely
- [ ] Docker layer security scanning
- [ ] API rate limiting enabled

## Scaling Considerations

For high-traffic scenarios:

1. **Load Balancer**: Use Nginx or HAProxy in front
2. **Multiple Backend Instances**: Use Docker Swarm or Kubernetes
3. **Database Replication**: MySQL Master-Slave setup
4. **Read Replicas**: For reporting and search
5. **CDN**: CloudFlare or AWS CloudFront for static content
6. **Message Queue**: RabbitMQ or Kafka for async jobs

## Support & Monitoring Tools

- **Sentry**: Error tracking - https://sentry.io
- **DataDog**: Infrastructure monitoring
- **New Relic**: APM and performance monitoring
- **Grafana**: Metrics visualization
- **ELK Stack**: Centralized logging

## Troubleshooting Production Issues

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a
docker volume prune

# Check log sizes
du -sh /var/lib/docker/containers/*/*-json.log
```

### High Memory Usage

```bash
# Monitor memory
docker stats --no-stream

# Increase limits in docker-compose.yml
# Or increase server resources
```

### Database Lock

```bash
# Check database connections
docker-compose exec mysql mysql -u freelance_user -p$MYSQL_PASSWORD -e "SHOW PROCESSLIST;"

# Kill long-running queries
docker-compose exec mysql mysql -u freelance_user -p$MYSQL_PASSWORD -e "KILL 123;"
```

---

For more information on production deployments, see official Docker documentation:
- https://docs.docker.com/engine/swarm/
- https://docs.docker.com/compose/production/
