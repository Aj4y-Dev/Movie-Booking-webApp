## Design concept

### Models:

1. USER [CLIENT | USER | SYSTEM_ADMIN | ROOT_ADMIN]
2. MOVIE
3. THEATRE
4. SHOW
5. SEAT
6. BOOKING
7. PAYMENT

### Attributes of models:

- USER : name, email, password, role, refreshToken
- MOVIE : name, description, casts, trailerUrl, language[], releaseDate, director, releaseStatus, createdBy
- THEATRE : name, description, city, postalCode, address, ownerID
- SHOW : movie_id, theatre_id, showTime, totalSeats, availableSeats, standardPrice, premiumPrice, vipPrice, status, createdBy
- SEAT : show_id, seatNumber, row, type, price, isBooked, bookedBy, isLocked, lockedBy, lockedAt, lockExpiresAt
- BOOKING : user_id, show_id, seats, status, paymentStatus, paymentId, bookedAt, cancelledAt
- PAYMENT : booking_id, user_id, amount, status, transactionId, paymentDate

### Relationship between each other:

- User with Theatre [One-to-Many (1:N)] One theatre owner can own multiple theatres.
- User with Movie [One-to-Many (1:N)] One admin can create many movies.
- Movie with Show [One-to-Many (1:N)] One movie can have many shows.
- Theatre with Show [One-to-Many (1:N)] One theatre hosts many shows.
- Show with Seat [One-to-Many (1:N)] One show has many seat states (Available, Locked, Booked).
- User with Booking [One-to-Many (1:N)] One user can create many bookings.
- Show with Booking [One-to-Many (1:N)] One show can have many bookings.
- Booking with Payment [One-to-One (1:1)] One booking has one payment record.
- User with Payment [One-to-Many (1:N)] One user can make many payments.

### Role Hierarchy (Access Priority)

The system follows a hierarchical role-based access control (RBAC) model. Access privileges increase from bottom to top.

```
        ROOT_ADMIN
             ▲
             │
      SYSTEM_ADMIN
             ▲
             │
     THEATRE_OWNER (USER)
             ▲
             │
          CLIENT
```

## Overall System Workflow

1. Anyone can register and log in. Every newly registered account is assigned the `CLIENT` role by default.
2. There is only one `ROOT_ADMIN`, which is created directly in the database. No public API endpoint exists to create a `ROOT_ADMIN`.
3. The `ROOT_ADMIN` can create `SYSTEM_ADMIN` accounts. Each `SYSTEM_ADMIN` is responsible for managing theatres within a specific city, state, or province.
4. A `SYSTEM_ADMIN` can create `THEATRE_OWNER` accounts and new Theatre.
5. A `THEATRE_OWNER` can own one or more theatres and can create movies and schedule shows for those theatres.
6. A `CLIENT` can browse movies, select a show, choose seats, and create a booking.
7. When seats are selected, they are locked for 5 minutes. During this period, no other client can reserve the same seats.
8. If the payment is completed within 5 minutes, the seats become permanently booked.
9. If the payment is not completed before the lock expires, the booking is cancelled, the seat lock is removed, and the seats become available for other clients in real time.
