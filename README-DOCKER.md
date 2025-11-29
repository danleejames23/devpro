# Freelance Website - Docker Setup

This guide will help you set up the freelance website with Docker and PostgreSQL database.

## Prerequisites

- Docker Desktop installed and running
- Node.js 18+ (for development)
- Git (optional)

## Quick Setup

1. **Run the setup script:**
   ```bash
   setup-docker.bat
   ```

2. **Or manually:**
   ```bash
   # Install dependencies
   npm install

   # Start with Docker
   docker-compose up --build -d
   ```

## Services

- **Web Application**: http://localhost:3000
- **PostgreSQL Database**: localhost:5434
- **Redis Cache**: localhost:6379

## Database Details

- **Database**: freelance_website
- **Username**: freelance_user
- **Password**: freelance_password_2024
- **Host**: localhost (or postgres in Docker network)
- **Port**: 5434

## Default Accounts

### Admin Account
- **URL**: http://localhost:3000/admin
- **Username**: admin
- **Password**: admin123

### Sample Customer Account
- **Email**: john.doe@example.com
- **Password**: admin123

## Environment Variables

The application uses these environment variables:

```env
DATABASE_URL=postgresql://freelance_user:freelance_password_2024@postgres:5432/freelance_website
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=production
```

## Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Access database directly
docker exec -it freelance_db psql -U freelance_user -d freelance_website
```

## Database Schema

The database includes these main tables:

- **customers** - User accounts with authentication
- **quotes** - Quote requests from customers
- **projects** - Active projects derived from quotes
- **invoices** - Billing and payment tracking
- **payment_methods** - Customer payment information
- **project_files** - File management system
- **github_repositories** - GitHub integration
- **messages** - Customer communication
- **notifications** - System notifications

## Features

### Client Portal
- User registration and authentication
- Project dashboard with real-time updates
- File management with GitHub integration
- Billing and invoice management
- Profile management with comprehensive business info

### Admin Panel
- Quote management and approval
- Customer management
- Project tracking
- Analytics and reporting

### File Management
- Upload and organize project files
- GitHub repository integration
- File sharing and collaboration
- Version control integration

### Billing System
- Invoice generation and tracking
- Payment method management
- Billing statistics and reporting
- Automated payment processing

## Development

For development with hot reload:

```bash
# Start database only
docker-compose up postgres redis -d

# Run Next.js in development mode
npm run dev
```

## Troubleshooting

### Database Connection Issues
1. Ensure Docker is running
2. Check if port 5432 is available
3. Verify database credentials in docker-compose.yml

### Build Issues
1. Clear Docker cache: `docker system prune -a`
2. Rebuild containers: `docker-compose up --build -d`
3. Check logs: `docker-compose logs`

### Authentication Issues
1. Verify bcrypt is working properly
2. Check database connection
3. Ensure proper password hashing

## Production Deployment

For production:

1. Update environment variables
2. Use proper SSL certificates
3. Configure proper database backups
4. Set up monitoring and logging
5. Use production-ready secrets

## Support

For issues or questions:
1. Check Docker logs: `docker-compose logs`
2. Verify database connectivity
3. Check application logs in the container
