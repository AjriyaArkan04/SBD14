# 🧪 Testing API - Complete Guide

Setelah backend berhasil connect ke Neon, test API endpoints berikut.

## Prerequisites

- Backend server running di `http://localhost:5000`
- Postman, Thunder Client, atau cURL

## 1️⃣ Health Check

Test apakah server running:

```bash
# cURL
curl http://localhost:5000/api/health

# Response
{
  "message": "Server is running",
  "timestamp": "2024-05-16T10:30:00.000Z"
}
```

---

## 2️⃣ User Management

### Register User

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "createdAt": "2024-05-16T10:30:00.000Z"
  }
}
```

### Login User

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Get All Users

```bash
curl http://localhost:5000/api/users
```

### Get User by ID

```bash
curl http://localhost:5000/api/users/550e8400-e29b-41d4-a716-446655440000
```

### Update User

```bash
curl -X PUT http://localhost:5000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

### Delete User

```bash
curl -X DELETE http://localhost:5000/api/users/550e8400-e29b-41d4-a716-446655440000
```

---

## 3️⃣ Restaurant Management

### Create Restaurant

```bash
curl -X POST http://localhost:5000/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pizza Palace",
    "description": "Authentic Italian Restaurant",
    "address": "Jl. Merdeka 123",
    "city": "Jakarta",
    "cuisine": "Italian",
    "phone": "021-12345678",
    "opening_time": "11:00:00",
    "closing_time": "23:00:00",
    "owner_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Get All Restaurants

```bash
curl http://localhost:5000/api/restaurants
```

### Get Restaurants by City

```bash
curl http://localhost:5000/api/restaurants/city/Jakarta
```

### Get Restaurant by ID

```bash
curl http://localhost:5000/api/restaurants/restaurant-uuid
```

### Update Restaurant

```bash
curl -X PUT http://localhost:5000/api/restaurants/restaurant-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pizza Palace Updated",
    "closing_time": "00:00:00"
  }'
```

### Delete Restaurant

```bash
curl -X DELETE http://localhost:5000/api/restaurants/restaurant-uuid
```

---

## 4️⃣ Table Management

### Create Table

```bash
curl -X POST http://localhost:5000/api/tables \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "restaurant-uuid",
    "table_number": "T-01",
    "capacity": 4,
    "status": "available",
    "location": "indoor"
  }'
```

### Get All Tables

```bash
curl http://localhost:5000/api/tables
```

### Get Tables by Restaurant

```bash
curl http://localhost:5000/api/tables/restaurant/restaurant-uuid
```

### Get Available Tables

```bash
curl 'http://localhost:5000/api/tables/restaurant/restaurant-uuid/available?capacity=4'
```

### Update Table

```bash
curl -X PUT http://localhost:5000/api/tables/table-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "capacity": 6
  }'
```

### Update Table Status

```bash
curl -X PATCH http://localhost:5000/api/tables/table-uuid/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "reserved"
  }'
```

Valid statuses: `available`, `reserved`, `maintenance`

### Delete Table

```bash
curl -X DELETE http://localhost:5000/api/tables/table-uuid
```

---

## 5️⃣ Reservation Management

### Create Reservation

```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "customer-uuid",
    "restaurant_id": "restaurant-uuid",
    "table_id": "table-uuid",
    "reservation_date": "2024-05-20",
    "start_time": "19:00:00",
    "end_time": "21:00:00",
    "guest_count": 4,
    "special_request": "Near window please"
  }'
```

### Get All Reservations

```bash
curl http://localhost:5000/api/reservations
```

### Get Reservations by Customer

```bash
curl http://localhost:5000/api/reservations/customer/customer-uuid
```

### Get Reservations by Restaurant

```bash
curl http://localhost:5000/api/reservations/restaurant/restaurant-uuid
```

### Get Reservation by ID

```bash
curl http://localhost:5000/api/reservations/reservation-uuid
```

### Confirm Reservation (Admin)

```bash
curl -X PATCH http://localhost:5000/api/reservations/reservation-uuid/confirm \
  -H "Content-Type: application/json"
```

### Reject Reservation (Admin)

```bash
curl -X PATCH http://localhost:5000/api/reservations/reservation-uuid/reject \
  -H "Content-Type: application/json" \
  -d '{
    "rejection_reason": "Table no longer available"
  }'
```

### Cancel Reservation

```bash
curl -X PATCH http://localhost:5000/api/reservations/reservation-uuid/cancel \
  -H "Content-Type: application/json"
```

### Complete Reservation

```bash
curl -X PATCH http://localhost:5000/api/reservations/reservation-uuid/complete \
  -H "Content-Type: application/json"
```

### Update Reservation

```bash
curl -X PUT http://localhost:5000/api/reservations/reservation-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "guest_count": 5,
    "special_request": "Birthday celebration"
  }'
```

### Delete Reservation

```bash
curl -X DELETE http://localhost:5000/api/reservations/reservation-uuid
```

---

## 📋 Full Test Scenario

### 1. Create Admin User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```
Save admin ID: `ADMIN_ID`

### 2. Create Restaurant
```bash
curl -X POST http://localhost:5000/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Restaurant",
    "address": "Jl. Test 123",
    "city": "Jakarta",
    "opening_time": "11:00:00",
    "closing_time": "23:00:00",
    "owner_id": "ADMIN_ID"
  }'
```
Save restaurant ID: `RESTAURANT_ID`

### 3. Create Table
```bash
curl -X POST http://localhost:5000/api/tables \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "RESTAURANT_ID",
    "table_number": "T-01",
    "capacity": 4
  }'
```
Save table ID: `TABLE_ID`

### 4. Create Customer User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Customer",
    "email": "customer@example.com",
    "password": "customer123",
    "role": "customer"
  }'
```
Save customer ID: `CUSTOMER_ID`

### 5. Create Reservation
```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUSTOMER_ID",
    "restaurant_id": "RESTAURANT_ID",
    "table_id": "TABLE_ID",
    "reservation_date": "2024-05-20",
    "start_time": "19:00:00",
    "end_time": "21:00:00",
    "guest_count": 4
  }'
```
Save reservation ID: `RESERVATION_ID`

### 6. Confirm Reservation
```bash
curl -X PATCH http://localhost:5000/api/reservations/RESERVATION_ID/confirm \
  -H "Content-Type: application/json"
```

### 7. Complete Reservation
```bash
curl -X PATCH http://localhost:5000/api/reservations/RESERVATION_ID/complete \
  -H "Content-Type: application/json"
```

---

## 🔧 Using Postman

1. **Import Collection:**
   - File → Import → Paste raw JSON atau URL

2. **Set Environment Variables:**
   - Klik gear icon → Manage Environments
   - Tambah variable: `base_url=http://localhost:5000`

3. **Use in Requests:**
   - Gunakan `{{base_url}}/api/users` di URL

---

## ⚠️ Common Issues

### 401 Unauthorized
- Pastikan sudah login atau auth token valid

### 404 Not Found
- Check apakah ID benar dan resource sudah ada
- Pastikan route URL-nya benar

### 400 Bad Request
- Check request JSON format
- Pastikan required fields sudah ada
- Pastikan data types benar (date format: YYYY-MM-DD, time: HH:MM:SS)

### 409 Conflict
- Untuk reservasi: mungkin ada conflict dengan reservation lain
- Coba table/waktu lain atau cek availability dulu

---

## 💡 Tips

- Simpan IDs dari response untuk next requests
- Cek console backend untuk debugging
- Gunakan `application/json` header untuk semua POST/PUT/PATCH
- Jangan lupa copy connection string dengan `?sslmode=require` untuk Neon

Happy testing! 🚀
