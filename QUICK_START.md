# Quick Start Guide for Freelance Marketplace

## 🚀 Quick Start (5 Minutes)

### For Windows Users

```bash
# 1. Create environment file
copy .env.example .env

# Edit .env with your credentials (Gmail, Cloudinary, Stripe)

# 2. Start everything
docker-manage.bat up

# 3. Wait for services to start (30-60 seconds)
# Then open: http://localhost
```

### For Mac/Linux Users

```bash
# 1. Create environment file
cp .env.example .env

# Edit .env with your credentials

# 2. Make script executable
chmod +x docker-manage.sh

# 3. Start everything
./docker-manage.sh up

# 4. Wait for services to start
# Then open: http://localhost
```

## 📋 What Gets Started

- **Frontend** - React app at http://localhost
- **Backend** - Java Spring Boot API at http://localhost:8080
- **MySQL** - Database at localhost:3306
- **Redis** - Cache at localhost:6379
- **Elasticsearch** - Search at http://localhost:9200

## 🔧 Common Tasks

### Stop Everything
```bash
docker-manage up    # Windows: docker-manage.bat up
```

### View Logs
```bash
docker-manage logs  # Windows: docker-manage.bat logs
```

### Check Health
```bash
docker-manage test  # Windows: docker-manage.bat test
```

### Get Shell Access
```bash
# Connect to backend
docker-compose exec backend bash

# Connect to MySQL
docker-compose exec mysql mysql -u freelance_user -p freelance_marketplace

# Connect to Redis
docker-compose exec redis redis-cli
```

## 🌐 URLs

| Service | URL |
|---------|-----|
| Website | http://localhost |
| API Docs | http://localhost:8080/swagger-ui.html |
| Elasticsearch | http://localhost:9200 |

## ⚙️ Configuration

Your credentials are in `.env` file:
- Gmail (for email notifications)
- Cloudinary (for image uploads)
- Stripe (for payments)

Get these from:
1. Gmail App Password: https://myaccount.google.com/apppasswords
2. Cloudinary: https://cloudinary.com/console
3. Stripe: https://dashboard.stripe.com

## 🐛 Troubleshooting

### Port 80 Already in Use
Edit docker-compose.yml and change:
```yaml
frontend:
  ports:
    - "8000:80"  # Changed from 80:80
```

### Services Not Starting
```bash
docker-compose down -v  # Remove all data
docker-compose up -d    # Start fresh
docker-compose logs     # View what's wrong
```

### Database Not Initializing
```bash
docker-compose exec mysql mysql -u freelance_user -p freelance_marketplace
```

## 📚 Full Documentation

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed instructions and advanced configuration.

## 🎯 Next Steps

1. Create `.env` with your credentials
2. Run `docker-manage up` (or `docker-manage.bat up` on Windows)
3. Open http://localhost
4. Register as user or admin
5. Start exploring the Freelance Marketplace!

## 💡 Tips

- Keep Docker Desktop running in background
- Don't commit `.env` file to Git
- Use `docker-manage test` to verify everything is working
- Check `docker-compose logs` when something seems wrong
- Increase Docker Desktop memory if containers are slow (Settings > Resources)

---

Happy coding! 🎉
