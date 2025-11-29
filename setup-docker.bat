@echo off
echo Setting up Freelance Website with Docker...

echo.
echo Installing dependencies...
npm install

echo.
echo Building Docker containers...
docker-compose down
docker-compose up --build -d

echo.
echo Waiting for database to be ready...
timeout /t 10

echo.
echo Database should be ready!
echo.
echo Access your application at: http://localhost:3000
echo Database is running on: localhost:5432
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
pause
