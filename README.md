# Lost and Found Backend API

Express + MySQL REST API for a campus Lost and Found board.

## Setup
1. `npm install`
2. Create the database: `mysql -u root -p < schema.sql`
3. Copy `.env.example` to `.env` and set your MySQL credentials.
4. `npm start` (runs on http://localhost:3000)

## Endpoints
| Method | Path | Success | Errors |
|---|---|---|---|
| GET | /api/items (`?category=&is_claimed=`) | 200 | 400 bad filter |
| GET | /api/items/:id | 200 | 400 bad id, 404 |
| POST | /api/items | 201 | 400 validation |
| PUT | /api/items/:id | 200 | 400 id/validation, 404 |
| DELETE | /api/items/:id | 204 | 400 bad id, 404 |

Item body: `name`, `category` (phone, keys, id_card, book, bag, clothing, electronics, wallet, other),
`location_found`, `date_found` (YYYY-MM-DD or ISO, not in future), optional `description`, optional `is_claimed` (boolean).

Security: all queries are parameterised (mysql2 prepared statements), ids are validated,
request size is limited, and internal errors never leak details.

## Testing
Import `LostAndFound.postman_collection.json` into Postman and run the collection in order.
