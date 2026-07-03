### features:

Authentication and authorization.
Root admin (Access to all features) which will be registered in db (no api endpoint)
other system admin can be register in the app with root admin approval
Client can register to the system but will require approval from admins. (Client are theater owners)
Customers (normal user) can directly register to the app.
Login api will be working on token based auth.

List movies and halls.

- we will setup movie theater resource
- creation of a new theater, ability to update an existing one
- fetch all the theaters, filter the theaters based on pin/ city and delete a theater

movies

- add movies in theater
- Remove movies in a theater
- List all theater in which a movie is running.
- Search for the movie
- all movies from a theater
- Details about movie

Booking

- setup data model booking and transaction.
- Auth users can book a movie
- Ability to cancel a booking
- Ability to make payment
- List all your bookings - past booking(everything)

Actor Profile

- System admin : administrator of the whole system, Super user access, CRUD operation on all resource, CRUD operation on client.
- Client : these are the owners of the a movie hall. One client can be the owner of multiple halls. CRUD operation only on the theater owned by them
- Users : our main end users/customers visiting the app and have details registred into the system. Able to browse movie and theaters , make & cancel, listing booking and payment, drop ratings and reviews for movies and theaters
- Un registred users : are those users who are visiting the app but not register in the system, Browse movie and theaters

### Some relationship

```
Movie ←── Show ───→ Theatre
           ↑
           │
          Seat
           ↑
           │
         Booking ──→ User
```

In context of Nepal cinema halls like QFX, Big Movies:

Seat Layout (200 seats - 20 rows × 10 seats):

```
SCREEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ROW A → A1-A10 STANDARD Rs.300 (index 0)
ROW B → B1-B10 STANDARD Rs.310 (index 1)
ROW C → C1-C10 STANDARD Rs.320 (index 2)
ROW D → D1-D10 STANDARD Rs.330 (index 3)
ROW E → E1-E10 STANDARD Rs.340 (index 4)
ROW F → F1-F10 STANDARD Rs.350 (index 5)
━━━━━━━━ STANDARD (60 seats, Rs.300-350) ━━━━━━━━

ROW G → G1-G10 PREMIUM Rs.500 (index 6)
ROW H → H1-H10 PREMIUM Rs.510 (index 7)
ROW I → I1-I10 PREMIUM Rs.520 (index 8)
ROW J → J1-J10 PREMIUM Rs.530 (index 9)
ROW K → K1-K10 PREMIUM Rs.540 (index 10)
ROW L → L1-L10 PREMIUM Rs.550 (index 11)
ROW M → M1-M10 PREMIUM Rs.560 (index 12)
ROW N → N1-N10 PREMIUM Rs.570 (index 13)
━━━━━━━━ PREMIUM (80 seats, Rs.500-570) ━━━━━━━━

ROW O → O1-O10 VIP Rs.700 (index 14)
ROW P → P1-P10 VIP Rs.750 (index 15)
ROW Q → Q1-Q10 VIP Rs.800 (index 16)
ROW R → R1-R10 VIP Rs.850 (index 17)
ROW S → S1-S10 VIP Rs.900 (index 18)
ROW T → T1-T10 VIP Rs.1000 (index 19)
━━━━━━━━ VIP (60 seats, Rs.700-1000) ━━━━━━━━

BACK OF HALL
```

- Total: 200 seats
- STANDARD: 60 seats (30%)
- PREMIUM: 80 seats (40%)
- VIP: 60 seats (30%)

about this layout:

- STANDARD (A-F) — front rows
- closest to screen
- slight neck strain
- cheapest — Rs.300-350
- 60 seats (30%)

- PREMIUM (G-N) — middle rows
- best viewing angle
- most popular
- Rs.500-600
  -80 seats (40%)

- VIP (O-T) — back rows
- farthest from screen
- most comfortable
- recliner seats in some halls
- Rs.700-1000
- 60 seats (30%)

### Challenges

1. CONCURRENT SEAT BOOKING (hardest)

Two users select same seat at exact same time

- both see seat as available
- both try to book
- race condition

Solution:

- MongoDB transactions
- Optimistic locking
- Redis distributed locks
- Socket.io realtime updates

2. SEAT LOCK EXPIRY

User locks seat but never pays

- seat stuck as locked forever

Solution:

- Bull job queue — auto release after 5 min
- TTL index on lockExpiresAt
- Socket.io emit seat available

3. PAYMENT FAILURES

User pays but payment gateway fails

- money deducted but ticket not issued
- ticket issued but money not deducted

Solution:

- Idempotency keys
- Webhook from payment gateway
- Pending → Confirmed → Failed states

4. SHOW CANCELLATION (Optional)

Admin cancels a show

- all bookings need refund
- all seats need to be freed
- all users need notification

Solution:

- MongoDB transactions
- Bulk refund processing
- Email/SMS notification queue

### Security

- Helmet → HTTP headers
- Rate limiting → prevent abuse
- CORS → configured properly
- bcrypt → password hashing
- express-mongo-sanitize (NoSQL injection)
- Input validation (Zod)
- Payment webhook verification

### Jwt

asymmetric cryptography (RS256) is more secure than symmetric (HS256):

Symmetric (HS256) vs Asymmetric (RS256):

HS256 (symmetric)

one secret key → signs AND verifies
JWT_SECRET = "mysecret123"

BENEFITS:

- simple — one secret key
- fast — HMAC is faster than RSA
- easy to implement
- perfect for single server apps
- less setup — no key pair generation
- smaller token size

DISADVANTAGES:

- secret must be shared with every service that needs to verify token
- if secret leaks → attacker forges any token
- not suitable for microservices
- all services have signing power(any service can create tokens)
- harder to rotate — must update all services

RS256 (asymmetric)

private key → signs token (only auth server has this)
public key → verifies token (any service can have this)

BENEFITS:

- private key never leaves auth server
- other services only need public key (cant forge tokens even if public key leaks)
- perfect for microservices
- industry standard (Google, GitHub, Auth0)
- easy key distribution (public key can be shared openly)
- supports JWKS (public key auto discovery)
- clear separation of concerns
- only auth server can sign
- anyone can verify

DISADVANTAGES:

- slower than HS256 (RSA math is complex)
- larger token size
- more complex setup
- key pair management needed
- overkill for single server apps

for this project i will use the RS256 (asymmetric) cryptography method

Generate RSA key pair:

# generate private key

openssl genrsa -out private.pem 2048

# generate public key from private key

openssl rsa -in private.pem -pubout -out public.pem

also adding the access & refresh token

i will store refresh token in DB:

WITHOUT storing in DB
user logs out

- refresh token still valid for 7 days
- attacker who stole token can still get new access tokens
- no way to invalidate it

// WITH storing in DB
user logs out

- clear refreshToken from DB
- attacker tries to use stolen token
- server checks DB → token not found
- access denied

// other scenarios where DB storage helps
user changes password → clear all refresh tokens
admin bans user → clear refresh token
suspicious activity → revoke all sessions

### Resource

```
https://github.com/jlgriff/jwt-asymmetric-authentication/ for RS256 (asymmetric) JWT
https://github.com/ryder-tech/nodejs-advance/ for RS256 (asymmetric) JWT
https://dev.to/sagarmuchhal/securing-nodejs-applications-with-helmet-3m85 (Securing Node.js Applications with Helmet)
https://medium.com/@nalaka_sampath/a-comprehensive-guide-to-socket-io-building-real-time-applications-5746171e647e(socket.io)
```
