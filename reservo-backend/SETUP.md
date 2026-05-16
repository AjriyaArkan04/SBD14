# 🚀 Reservo Backend - Complete Setup Guide

Setup database PostgreSQL dengan Neon dan connect ke backend.

## 📋 Prerequisites

- Node.js v14+ installed
- Neon account (free at https://neon.tech)
- Internet connection

---

## ⚡ QUICK START (10 minutes)

### 1. Setup Neon Database

```bash
# A. Buka https://neon.tech
# B. Sign up (pilih Google/GitHub untuk cepat)
# C. Buat project baru:
#    - Name: "reservo"
#    - Region: "ap-southeast-1 (Singapore)" untuk Asia
# D. TUNGGU 1-2 menit, nanti akan dapat:
#    - Database: neondb
#    - Username: neondb_owner
#    - Password: (SAVE INI!)
#    - Host: ep-xxx.us-east-1.aws.neon.tech
```

### 2. Get Connection String

**Di Neon Dashboard:**
- Buka project Anda
- Cari bagian "Connection string"
- Copy line yang ada `postgresql://`

**Contoh:**
```
postgresql://neondb_owner:L8k9mN2pQrSt@ep-wonderful-silence-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Update .env File

Edit file `.env` di folder `reservo-backend/`:

```env
# Copy paste dari Neon - PILIH SALAH SATU:

# OPTION 1 (Recommended): Full Connection String
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# OPTION 2: Manual Configuration
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=password_dari_neon
DB_HOST=ep-xxx.us-east-1.aws.neon.tech
DB_PORT=5432

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-secret-key-here
```

### 4. Install Dependencies

```bash
cd reservo-backend
npm install
```

### 5. Sync Database

```bash
npm run sync-db
```

Output yang diharapkan:
```
🔄 Connecting to database...
📝 Creating/Updating tables...
✅ All models synchronized successfully.

📋 Tables in database:
   1. users
   2. restaurants
   3. tables
   4. reservations
```

### 6. Test Connection

```bash
npm run test-connection
```

Output yang diharapkan:
```
✅ PostgreSQL connected successfully.
📊 Database Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PostgreSQL 14.6 on x86_64-pc-linux-gnu...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Everything looks good!
```

### 7. Start Development Server

```bash
npm run dev
```

Server akan running di: **http://localhost:5000**

**Test API:**
```bash
# Di terminal atau browser
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "message": "Server is running",
  "timestamp": "2024-05-16T10:30:00.000Z"
}
```

---

## 📋 Available Commands

```bash
npm run dev                # Start development server (dengan auto-reload)
npm run start              # Start production server
npm run sync-db            # Create/update database tables
npm run test-connection    # Test database connection
```

---

## 🔧 Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_NAME` | Database name | `neondb` |
| `DB_USER` | Database user | `neondb_owner` |
| `DB_PASSWORD` | Database password | `L8k9mN2pQrSt` |
| `DB_HOST` | Database host (from Neon) | `ep-xxx.us-east-1.aws.neon.tech` |
| `DB_PORT` | Database port | `5432` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `development` atau `production` |
| `JWT_SECRET` | Secret key untuk JWT tokens | (random string) |

---

## ✅ Checklist

- [ ] Neon account dibuat
- [ ] Project "reservo" dibuat di Neon
- [ ] Connection string di-copy dari Neon
- [ ] `.env` file di-update dengan credentials
- [ ] Dependencies di-install (`npm install`)
- [ ] Database di-sync (`npm run sync-db`)
- [ ] Connection di-test (`npm run test-connection`)
- [ ] Server berjalan (`npm run dev`)
- [ ] Health check berhasil (http://localhost:5000/api/health)

---

## 🐛 Troubleshooting

### ❌ Error: "connect ECONNREFUSED"

**Problem:** Cannot connect to database

**Solutions:**
1. Check `.env` - pastikan semua `DB_*` variables ada
2. Copy lagi connection string dari Neon
3. Test host: `ping ep-xxx.us-east-1.aws.neon.tech`
4. Check internet connection

```bash
# Debug command
node scripts/testConnection.js
```

### ❌ Error: "password authentication failed"

**Problem:** Password salah atau ada special character

**Solutions:**
1. Check password di Neon dashboard
2. Jika ada special character, gunakan full connection string dari Neon
3. Copy paste lagi dari Neon, jangan manual

### ❌ Error: "SSL connection error"

**Problem:** Neon require SSL connection

**Solution:** 
Pastikan connection string include `?sslmode=require` di akhir:
```
postgresql://user:pass@host/db?sslmode=require
                                     ↑↑↑↑ PENTING
```

### ❌ Error: "ENOENT: no such file or directory, open '.env'"

**Problem:** `.env` file tidak ada

**Solution:**
```bash
cp .env.example .env
# Edit .env dengan text editor
```

### ❌ Port 5000 already in use

**Solution:**
```bash
# Gunakan port lain
PORT=3000 npm run dev

# Atau kill process di port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

### ❌ "Cannot find module 'express'"

**Problem:** Dependencies belum di-install

**Solution:**
```bash
npm install
```

---

## 📚 API Endpoints Quick Reference

```bash
# Health Check
GET /api/health

# User Management
POST /api/users/register
POST /api/users/login
GET /api/users
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id

# Restaurants
POST /api/restaurants
GET /api/restaurants
GET /api/restaurants/:id
PUT /api/restaurants/:id
DELETE /api/restaurants/:id

# Tables
POST /api/tables
GET /api/tables
GET /api/tables/:id
PATCH /api/tables/:id/status

# Reservations
POST /api/reservations
GET /api/reservations
GET /api/reservations/:id
PATCH /api/reservations/:id/confirm
PATCH /api/reservations/:id/cancel
```

---

## 🔒 Security Notes

- **Jangan push `.env` ke GitHub** - file sudah di `.gitignore`
- **Change JWT_SECRET** sebelum production
- **Use strong password** untuk database
- **Enable backups** di Neon untuk production

---

## 📞 Need Help?

- Neon Docs: https://neon.tech/docs
- PostgreSQL Docs: https://www.postgresql.org/docs
- Express Docs: https://expressjs.com
- Sequelize Docs: https://sequelize.org

---

## 🎉 Next Steps

Setelah setup selesai:

1. **Test endpoints dengan Postman/Thunder Client/Curl**
2. **Buat admin user untuk testing**
3. **Setup Frontend** - connect ke backend API
4. **Deploy ke production** - setup Neon production plan
5. **Add authentication middleware** untuk protected routes

---

Happy coding! 🚀
