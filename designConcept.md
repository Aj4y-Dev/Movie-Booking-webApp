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

Movie ←── Show ───→ Theatre

           ↑
           │
          Seat
           ↑
           │
         Booking ──→ User

In context of Nepal cinema halls like QFX, Big Movies:

Seat Layout (200 seats - 20 rows × 10 seats):

SCREEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━

ROW A → A1 A2 A3 A4 A5 A6 A7 A8 A9 A10
ROW B → B1 B2 B3 B4 B5 B6 B7 B8 B9 B10
ROW C → C1 C2 C3 C4 C5 C6 C7 C8 C9 C10
ROW D → D1 D2 D3 D4 D5 D6 D7 D8 D9 D10
ROW E → E1 E2 E3 E4 E5 E6 E7 E8 E9 E10
ROW F → F1 F2 F3 F4 F5 F6 F7 F8 F9 F10
━━━━━━━━━━━━━━━━━━ STANDARD (Rows A-F) Rs.300-350 ━━━

ROW G → G1 G2 G3 G4 G5 G6 G7 G8 G9 G10
ROW H → H1 H2 H3 H4 H5 H6 H7 H8 H9 H10
ROW I → I1 I2 I3 I4 I5 I6 I7 I8 I9 I10
ROW J → J1 J2 J3 J4 J5 J6 J7 J8 J9 J10
ROW K → K1 K2 K3 K4 K5 K6 K7 K8 K9 K10
ROW L → L1 L2 L3 L4 L5 L6 L7 L8 L9 L10
ROW M → M1 M2 M3 M4 M5 M6 M7 M8 M9 M10
ROW N → N1 N2 N3 N4 N5 N6 N7 N8 N9 N10
━━━━━━━━━━━━━━━━━━ PREMIUM (Rows G-N) Rs.500-600 ━━━━

ROW O → O1 O2 O3 O4 O5 O6 O7 O8 O9 O10
ROW P → P1 P2 P3 P4 P5 P6 P7 P8 P9 P10
ROW Q → Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8 Q9 Q10
ROW R → R1 R2 R3 R4 R5 R6 R7 R8 R9 R10
ROW S → S1 S2 S3 S4 S5 S6 S7 S8 S9 S10
ROW T → T1 T2 T3 T4 T5 T6 T7 T8 T9 T10
━━━━━━━━━━━━━━━━━━ VIP (Rows O-T) Rs.700-1000 ━━━━━━

                    ^ BACK OF HALL ^

about this layout:

STANDARD (A-F) — front rows
closest to screen
slight neck strain
cheapest — Rs.300-350
60 seats (30%)

PREMIUM (G-N) — middle rows  
 best viewing angle
most popular
Rs.500-600
80 seats (40%)

VIP (O-T) — back rows
farthest from screen
most comfortable
recliner seats in some halls
Rs.700-1000
60 seats (30%)
