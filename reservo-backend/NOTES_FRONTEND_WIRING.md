Backend endpoints used by the frontend (current project):

Restaurant
- GET /api/restaurants
- GET /api/restaurants/:id
- POST /api/restaurants (create)
- PUT /api/restaurants/:id
- DELETE /api/restaurants/:id

Table
- GET /api/tables
- GET /api/tables/:id
- POST /api/tables (create)
- PUT /api/tables/:id
- DELETE /api/tables/:id
- GET /api/tables/restaurant/:restaurant_id
- GET /api/tables/restaurant/:restaurant_id/available?capacity=&date=&start_time=
- PATCH /api/tables/:id/status

Reservation
- GET /api/reservations
- GET /api/reservations/:id
- POST /api/reservations (create)
- PUT /api/reservations/:id
- DELETE /api/reservations/:id
- GET /api/reservations/customer/:customer_id
- GET /api/reservations/restaurant/:restaurant_id
- PATCH /api/reservations/:id/confirm
- PATCH /api/reservations/:id/reject
- PATCH /api/reservations/:id/cancel
- PATCH /api/reservations/:id/complete

Reservation payload expected by backend:
- customer_id
- restaurant_id
- table_id
- reservation_date (DATEONLY)
- start_time (TIME)
- end_time (TIME)
- guest_count
- special_request (optional)

Reservation status values in DB:
- pending
- confirmed
- rejected
- cancelled
- completed

Frontend should map these to UI labels (Pending/Confirmed/etc.).

