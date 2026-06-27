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
