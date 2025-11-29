# 🚀 Production Setup Guide

This guide covers upgrading your freelance website from development to production with proper database, authentication, and email services.

## 📋 Overview of Upgrades

✅ **SQLite Database** - Replaced file-based storage with proper database  
✅ **Bcrypt Password Hashing** - Secure password storage  
✅ **SendGrid Email Service** - Professional email notifications  
✅ **Environment Variables** - Production configuration  
✅ **Session Management** - Secure customer authentication  

## 🔧 Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# Database (SQLite by default, PostgreSQL for production)
DATABASE_URL=./data/freelance.db
DATABASE_TYPE=sqlite

# SendGrid Email Service
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Business Name

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=86400

# App Configuration
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
NODE_ENV=production
```

## 📧 SendGrid Setup

1. **Create SendGrid Account**: Go to [sendgrid.com](https://sendgrid.com)
2. **Get API Key**: 
   - Go to Settings > API Keys
   - Create new API key with "Full Access"
   - Copy the key to `SENDGRID_API_KEY`
3. **Verify Domain**: Add your domain in SendGrid for better deliverability
4. **Update Email Settings**: Set `FROM_EMAIL` and `FROM_NAME` in environment variables

## 🗄️ Database Migration

The new system uses SQLite by default. To migrate from file storage:

### Automatic Migration (Recommended)
```bash
# The new system will automatically create database tables
npm run dev
```

### Manual Migration (If needed)
```javascript
// Run this script to migrate existing JSON data
const { migrateFromJsonToDatabase } = require('./src/lib/migration')
migrateFromJsonToDatabase()
```

## 🔐 Security Features

### Password Hashing
- Uses bcrypt with 12 rounds (configurable)
- Secure temporary password generation
- No plain text passwords stored

### Session Management
- HTTP-only cookies
- Secure session tokens
- Automatic cleanup of expired sessions
- 24-hour session timeout (configurable)

### API Security
- Input validation on all endpoints
- Error handling without data leakage
- Rate limiting ready (implement as needed)

## 🚀 Deployment Steps

### 1. Update API Routes
Replace the old API routes with new database-backed versions:

```bash
# Backup current routes
mv src/app/api/quotes/route.ts src/app/api/quotes/route-old.ts
mv src/app/api/auth/route.ts src/app/api/auth/route-old.ts

# Use new routes
mv src/app/api/quotes/route-v2.ts src/app/api/quotes/route.ts
mv src/app/api/auth/route-v2.ts src/app/api/auth/route.ts
```

### 2. Update Quote Page
Update the quote page to use the new client:

```typescript
// In src/app/quote/page.tsx
import { createQuoteAndAccount } from '@/lib/quote-client-v2'
// Replace the old import
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your production values
nano .env.local
```

### 4. Build and Deploy
```bash
# Install new dependencies (already done)
npm install

# Build for production
npm run build

# Deploy to your platform
netlify deploy --prod
# or
vercel --prod
```

## 📁 File Structure Changes

```
src/lib/
├── config.ts          # Environment configuration
├── database.ts        # SQLite database layer
├── auth.ts           # Password hashing & sessions
├── email.ts          # SendGrid email service
├── quote-client-v2.ts # Updated quote system
└── migration.ts      # Data migration utilities

data/
└── freelance.db      # SQLite database file
```

## 🧪 Testing Production Features

### Test Email Service
```bash
# Check if emails are working
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","description":"Test quote request"}'
```

### Test Authentication
```bash
# Test login with bcrypt
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"their_temp_password"}'
```

### Test Database
```bash
# Check database file
ls -la data/freelance.db

# View tables (optional)
sqlite3 data/freelance.db ".tables"
```

## 🔄 Rollback Plan

If you need to rollback to the old system:

```bash
# Restore old routes
mv src/app/api/quotes/route-old.ts src/app/api/quotes/route.ts
mv src/app/api/auth/route-old.ts src/app/api/auth/route.ts

# Remove new dependencies (optional)
npm uninstall bcryptjs @sendgrid/mail sqlite3 @types/bcryptjs
```

## 📊 Monitoring & Maintenance

### Database Backup
```bash
# Backup SQLite database
cp data/freelance.db data/backup-$(date +%Y%m%d).db
```

### Log Monitoring
- Check application logs for email delivery status
- Monitor authentication attempts
- Watch for database connection issues

### Performance
- Database indexes are automatically created
- Session cleanup runs automatically
- Consider database optimization for high traffic

## 🆘 Troubleshooting

### Common Issues

**Emails not sending:**
- Check `SENDGRID_API_KEY` is correct
- Verify `FROM_EMAIL` is verified in SendGrid
- Check console logs for email errors

**Database errors:**
- Ensure `data/` directory is writable
- Check SQLite file permissions
- Verify database initialization completed

**Authentication failing:**
- Check bcrypt rounds setting (12 is recommended)
- Verify password hashing is working
- Check session cookie settings

### Support
- Check console logs for detailed error messages
- All errors are logged with context
- Database operations include error handling

## 🎯 Next Steps

1. **Set up monitoring** (e.g., Sentry for error tracking)
2. **Configure backups** (automated database backups)
3. **Add rate limiting** (protect against abuse)
4. **Set up SSL certificates** (Let's Encrypt)
5. **Configure CDN** (for static assets)

---

Your freelance website is now production-ready with enterprise-grade features! 🎉
