# BeatBox Music Room - Instrument Loan API

BDF Group Assignment, Theme 9 of 30 (Instrument loans), Group 9 of 15, Section AIAGAI_2C.

Express + SQLite REST API that records which musician borrowed which instrument,
so instruments stop disappearing from the cupboard.

## Run
1. Install Node.js 18 or later.
2. `npm install`
3. `npm run reset` (optional, gives a clean database)
4. `npm start` -> http://localhost:3000
5. Import `BeatBox_Music_Room.postman_collection.json` into Postman and run the collection in order.

## Endpoints
| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| GET | /instruments | All instruments | 200 | - |
| GET | /instruments/:id | One instrument | 200 | 404 |
| POST | /instruments | Add (name, family) | 201 | 400 |
| PUT | /instruments/:id | Update (name, family) | 200 | 400, 404 |
| DELETE | /instruments/:id | Delete | 200 | 404 |
| GET | /instruments?family=Strings | Search by family (case-insensitive) | 200 | - |
| GET | /instruments/top | **Twist:** top 3 most loaned, with counts | 200 | - |
| GET | /musicians, /musicians/:id | List / get musicians | 200 | 404 |
| POST | /musicians | Add a musician | 201 | 400 |
| GET | /loans | **Join:** loans with musician and instrument name | 200 | - |
| POST | /loans | Lend an instrument | 201 | 400, 404 |
| PUT | /loans/:id/return | Mark as returned | 200 | 400, 404 |
| DELETE | /loans/:id | Delete a loan record | 200 | 404 |

## Twist: Top three
`GET /instruments/top` joins instruments with loans, uses `GROUP BY`, orders by count (highest first)
then name A-Z, and returns at most 3 rows. If only 2 instruments have been loaned it returns just 2.

## Structure
server.js (Part 1) | db/database.js (Part 2) | routes/*.js (Part 3) | middleware/validate.js (Part 4) | utils/topThree.js (Part 5) | Postman + README (Part 6)
