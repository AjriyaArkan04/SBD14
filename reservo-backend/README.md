# Reservo Backend API

Backend application untuk sistem reservasi restoran yang dibangun dengan Node.js, Express, dan PostgreSQL.

## Struktur Project

```
reservo-backend/
├── app.js                 # Main application entry point
├── package.json          # Project dependencies
├── .env.example          # Environment variables template
│
├── config/
│   ├── database.js       # Database configuration
│   └── redis.js          # Redis configuration (if needed)
│
├── models/
│   ├── User.js           # User model
│   ├── Restaurants.js    # Restaurant model
│   ├── Table.js          # Table model
│   ├── Reservation.js    # Reservation model
│   └── index.js          # Centralized model exports & associations
│
├── controllers/          # Business logic for each resource
│   ├── userController.js
│   ├── restaurantController.js
│   ├── tableController.js
│   └── reservationController.js
│
├── routes/              # API route definitions
│   ├── userRoutes.js
│   ├── restaurantRoutes.js
│   ├── tableRoutes.js
│   └── reservationRoutes.js
│
├── middleware/          # Custom middleware
│   └── errorHandler.js
│
└── scripts/             # Utility scripts
    └── syncDb.js        # Database sync script
```

## Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` dan sesuaikan dengan konfigurasi Anda:
```bash
cp .env.example .env
```

Edit `.env` dengan nilai yang sesuai:
```
DB_NAME=reservo_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
PORT=5000
JWT_SECRET=your-secret-key
```

### 3. Setup Database
Pastikan PostgreSQL sudah running, kemudian buat database:
```sql
CREATE DATABASE reservo_db;
```

### 4. Sync Database Models
```bash
node scripts/syncDb.js
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Restaurants
- `POST /api/restaurants` - Create restaurant
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `GET /api/restaurants/city/:city` - Get restaurants by city
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Tables
- `POST /api/tables` - Create table
- `GET /api/tables` - Get all tables
- `GET /api/tables/:id` - Get table by ID
- `GET /api/tables/restaurant/:restaurant_id` - Get tables by restaurant
- `GET /api/tables/restaurant/:restaurant_id/available` - Get available tables
- `PUT /api/tables/:id` - Update table
- `PATCH /api/tables/:id/status` - Update table status
- `DELETE /api/tables/:id` - Delete table

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/:id` - Get reservation by ID
- `GET /api/reservations/customer/:customer_id` - Get customer's reservations
- `GET /api/reservations/restaurant/:restaurant_id` - Get restaurant's reservations
- `PUT /api/reservations/:id` - Update reservation
- `PATCH /api/reservations/:id/confirm` - Confirm reservation
- `PATCH /api/reservations/:id/reject` - Reject reservation
- `PATCH /api/reservations/:id/cancel` - Cancel reservation
- `PATCH /api/reservations/:id/complete` - Complete reservation
- `DELETE /api/reservations/:id` - Delete reservation

## Request/Response Examples

### Register User
```bash
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "customer"
}
```

### Login
```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Create Restaurant
```bash
POST /api/restaurants
Content-Type: application/json

{
  "name": "Pizza Palace",
  "description": "Italian restaurant",
  "address": "Jl. Merdeka 123",
  "city": "Jakarta",
  "cuisine": "Italian",
  "phone": "021-12345678",
  "opening_time": "11:00:00",
  "closing_time": "23:00:00",
  "owner_id": "user-uuid-here"
}
```

### Create Table
```bash
POST /api/tables
Content-Type: application/json

{
  "restaurant_id": "restaurant-uuid-here",
  "table_number": "T-01",
  "capacity": 4,
  "status": "available",
  "location": "indoor"
}
```

### Create Reservation
```bash
POST /api/reservations
Content-Type: application/json

{
  "customer_id": "customer-uuid-here",
  "restaurant_id": "restaurant-uuid-here",
  "table_id": "table-uuid-here",
  "reservation_date": "2024-05-20",
  "start_time": "19:00:00",
  "end_time": "21:00:00",
  "guest_count": 4,
  "special_request": "Near window please"
}
```

## Architecture & Patterns

### Model-View-Controller (MVC)
- **Models**: Definisi struktur data dengan Sequelize ORM
- **Controllers**: Business logic untuk setiap resource
- **Routes**: HTTP route definitions yang map ke controllers

### Key Features

1. **User Authentication**
   - Password hashing dengan bcryptjs
   - JWT token generation untuk login
   - Role-based access (admin, customer)

2. **Reservation Management**
   - Check conflicts sebelum membuat reservation
   - Support multiple reservation statuses
   - Audit trail dengan timestamps

3. **Table Management**
   - Track table availability
   - Support different table locations
   - Capacity validation

4. **Error Handling**
   - Centralized error middleware
   - Consistent error response format
   - Proper HTTP status codes

## Database Schema Relationships

```
User (1) ──→ (Many) Restaurant
User (1) ──→ (Many) Reservation
Restaurant (1) ──→ (Many) Table
Restaurant (1) ──→ (Many) Reservation
Table (1) ──→ (Many) Reservation
Reservation ←── User
Reservation ←── Table
```

## Dependencies

- **express**: Web framework
- **sequelize**: ORM untuk database
- **pg**: PostgreSQL client
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management
- **express-validator**: Request validation
- **nodemon**: Development auto-reload

## Security Considerations

1. Selalu gunakan HTTPS dalam production
2. Validate semua input dari user
3. Use strong JWT secret key
4. Implement rate limiting
5. Add authentication middleware untuk protected routes
6. Use environment variables untuk sensitive data

## Future Enhancements

- [ ] Authentication middleware untuk protected routes
- [ ] Request validation dengan express-validator
- [ ] Database migrations dengan Sequelize CLI
- [ ] Unit testing dengan Jest/Mocha
- [ ] API documentation dengan Swagger/OpenAPI
- [ ] Logging system
- [ ] Caching dengan Redis
- [ ] Email notifications untuk reservasi
- [ ] Payment integration
- [ ] Rating & review system

## Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL sudah running
- Check DB credentials di .env file
- Pastikan database sudah dibuat

### Port Already in Use
Ubah PORT di .env file atau gunakan:
```bash
PORT=3001 npm run dev
```

### Dependencies Issue
```bash
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Follow existing code structure
2. Use meaningful commit messages
3. Test sebelum push

## License

ISC
