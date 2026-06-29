#!/bin/bash

# Docker Management Script for Freelance Marketplace
# This script helps manage Docker containers and services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_usage() {
    echo "Usage: ./docker-manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up              Start all services"
    echo "  down            Stop all services"
    echo "  build           Build all Docker images"
    echo "  rebuild         Rebuild all images from scratch"
    echo "  logs            View logs from all services"
    echo "  status          Check status of all containers"
    echo "  clean           Remove containers and volumes (WARNING: deletes data)"
    echo "  test            Run health checks on all services"
    echo "  backup          Backup database"
    echo "  restore         Restore database from backup"
    echo "  shell [service] Access shell of a service"
    echo "  help            Show this help message"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if docker and docker-compose are installed
check_dependencies() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker and Docker Compose are installed"
}

# Start services
start_services() {
    print_header "Starting All Services"
    docker-compose up -d
    print_success "All services started"
    sleep 5
    check_health
}

# Stop services
stop_services() {
    print_header "Stopping All Services"
    docker-compose down
    print_success "All services stopped"
}

# Build images
build_images() {
    print_header "Building Docker Images"
    docker-compose build
    print_success "All images built successfully"
}

# Rebuild images
rebuild_images() {
    print_header "Rebuilding Docker Images (No Cache)"
    docker-compose build --no-cache
    print_success "All images rebuilt successfully"
}

# View logs
view_logs() {
    print_header "Docker Compose Logs"
    docker-compose logs -f
}

# Check status
check_status() {
    print_header "Service Status"
    docker-compose ps
}

# Health checks
check_health() {
    print_header "Checking Service Health"
    
    echo "Checking MySQL..."
    if docker-compose exec -T mysql mysqladmin ping -h localhost &> /dev/null; then
        print_success "MySQL is healthy"
    else
        print_error "MySQL is not responding"
    fi
    
    echo "Checking Redis..."
    if docker-compose exec -T redis redis-cli ping &> /dev/null; then
        print_success "Redis is healthy"
    else
        print_error "Redis is not responding"
    fi
    
    echo "Checking Elasticsearch..."
    if docker-compose exec -T elasticsearch curl -s http://localhost:9200 &> /dev/null; then
        print_success "Elasticsearch is healthy"
    else
        print_error "Elasticsearch is not responding"
    fi
    
    echo "Checking Backend..."
    if curl -s http://localhost:8080/actuator/health &> /dev/null; then
        print_success "Backend is healthy"
    else
        print_error "Backend is not responding"
    fi
    
    echo "Checking Frontend..."
    if curl -s http://localhost &> /dev/null; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
    fi
}

# Clean up
clean_up() {
    print_warning "This will remove all containers and volumes!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        print_header "Cleaning Up"
        docker-compose down -v
        docker system prune -f
        print_success "Cleanup complete"
    else
        print_warning "Cleanup cancelled"
    fi
}

# Backup database
backup_database() {
    print_header "Backing Up MySQL Database"
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose exec -T mysql mysqldump -u freelance_user -p freelance_password freelance_marketplace > "$BACKUP_FILE"
    print_success "Database backed up to $BACKUP_FILE"
}

# Restore database
restore_database() {
    print_header "Restoring MySQL Database"
    read -p "Enter backup file path: " backup_file
    if [ -f "$backup_file" ]; then
        docker-compose exec -T mysql mysql -u freelance_user -p freelance_password freelance_marketplace < "$backup_file"
        print_success "Database restored from $backup_file"
    else
        print_error "Backup file not found: $backup_file"
    fi
}

# Access shell
access_shell() {
    local service=$1
    if [ -z "$service" ]; then
        read -p "Enter service name (backend/frontend/mysql/redis): " service
    fi
    
    case $service in
        backend|frontend|mysql|redis|elasticsearch)
            print_header "Accessing $service shell"
            docker-compose exec "$service" bash 2>/dev/null || docker-compose exec "$service" sh
            ;;
        *)
            print_error "Unknown service: $service"
            ;;
    esac
}

# Main script logic
if [ $# -eq 0 ]; then
    print_usage
    exit 0
fi

check_dependencies

case $1 in
    up)
        start_services
        ;;
    down)
        stop_services
        ;;
    build)
        build_images
        ;;
    rebuild)
        rebuild_images
        ;;
    logs)
        view_logs
        ;;
    status)
        check_status
        ;;
    test|health)
        check_health
        ;;
    clean)
        clean_up
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database
        ;;
    shell)
        access_shell "$2"
        ;;
    help|--help|-h)
        print_usage
        ;;
    *)
        print_error "Unknown command: $1"
        print_usage
        exit 1
        ;;
esac
