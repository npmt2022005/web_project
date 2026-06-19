@echo off
REM Docker Management Script for Freelance Marketplace (Windows)
REM This script helps manage Docker containers and services

setlocal enabledelayedexpansion

if "%1"=="" (
    call :print_usage
    exit /b 0
)

call :check_dependencies

if "%1"=="up" (
    call :start_services
) else if "%1"=="down" (
    call :stop_services
) else if "%1"=="build" (
    call :build_images
) else if "%1"=="rebuild" (
    call :rebuild_images
) else if "%1"=="logs" (
    call :view_logs
) else if "%1"=="status" (
    call :check_status
) else if "%1"=="test" (
    call :check_health
) else if "%1"=="clean" (
    call :clean_up
) else if "%1"=="backup" (
    call :backup_database
) else if "%1"=="help" (
    call :print_usage
) else (
    echo Unknown command: %1
    call :print_usage
    exit /b 1
)
exit /b 0

:print_usage
echo Usage: docker-manage.bat [command]
echo.
echo Commands:
echo   up              Start all services
echo   down            Stop all services
echo   build           Build all Docker images
echo   rebuild         Rebuild all images from scratch
echo   logs            View logs from all services
echo   status          Check status of all containers
echo   test            Run health checks on all services
echo   clean           Remove containers and volumes (WARNING: deletes data)
echo   backup          Backup database
echo   help            Show this help message
goto :eof

:check_dependencies
where docker >nul 2>nul
if !errorlevel! neq 0 (
    echo Docker is not installed
    exit /b 1
)
where docker-compose >nul 2>nul
if !errorlevel! neq 0 (
    echo Docker Compose is not installed
    exit /b 1
)
echo Docker and Docker Compose are installed
goto :eof

:start_services
echo.
echo ======================================== 
echo Starting All Services
echo ========================================
docker-compose up -d
echo All services started
timeout /t 5 /nobreak
call :check_health
goto :eof

:stop_services
echo.
echo ======================================== 
echo Stopping All Services
echo ========================================
docker-compose down
echo All services stopped
goto :eof

:build_images
echo.
echo ======================================== 
echo Building Docker Images
echo ========================================
docker-compose build
echo All images built successfully
goto :eof

:rebuild_images
echo.
echo ======================================== 
echo Rebuilding Docker Images (No Cache)
echo ========================================
docker-compose build --no-cache
echo All images rebuilt successfully
goto :eof

:view_logs
echo.
echo ======================================== 
echo Docker Compose Logs
echo ========================================
docker-compose logs -f
goto :eof

:check_status
echo.
echo ======================================== 
echo Service Status
echo ========================================
docker-compose ps
goto :eof

:check_health
echo.
echo ======================================== 
echo Checking Service Health
echo ========================================
echo Checking services...
timeout /t 2 /nobreak
docker-compose ps
goto :eof

:clean_up
echo.
echo WARNING: This will remove all containers and volumes!
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    docker-compose down -v
    docker system prune -f
    echo Cleanup complete
) else (
    echo Cleanup cancelled
)
goto :eof

:backup_database
echo.
echo ======================================== 
echo Backing Up MySQL Database
echo ========================================
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set BACKUP_FILE=backup_%mydate%_%mytime%.sql
docker-compose exec -T mysql mysqldump -u freelance_user -p freelance_password freelance_marketplace > %BACKUP_FILE%
echo Database backed up to %BACKUP_FILE%
goto :eof
