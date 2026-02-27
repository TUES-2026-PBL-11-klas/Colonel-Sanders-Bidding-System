# API Documentation

Base URL (local): `http://localhost:8080`

## Authentication

- Auth style: JWT Bearer token.
- `POST /api/auth/login` returns a JWT token.
- All `/api/auth/**` endpoints are **public** (no token required).
- All other endpoints (`/api/users/**`, `/api/products/**`, `/api/bids/**`) require a valid JWT token in the `Authorization: Bearer <token>` header.

## Content Types

- JSON: `application/json`
- File upload: `multipart/form-data`

---

## 1) Login

### `POST /api/auth/login`
Authenticate a user by email/password and return a JWT token.

- **Auth required:** No
- **Request body:** JSON

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

- **Success response:** `200 OK`

```json
{
  "token": "<jwt-token>",
  "needsPasswordReset": true
}
```

`needsPasswordReset` is `true` for users created via CSV import who haven't changed their password yet.

- **Possible error responses:**
  - `401 Unauthorized` when credentials are invalid

---

## 2) Register

### `POST /api/auth/register`
Create a single user account.

- **Auth required:** No
- **Request body:** JSON

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

- **Success response:** `200 OK`

```
Registered successfully
```

- **Error responses:**
  - `400 Bad Request` when email is already in use

---

## 4) Reset Password

### `POST /api/auth/reset-password`
Reset a user's password.

- **Auth required:** No
- **Request body:** JSON

```json
{
  "email": "user@example.com",
  "newPassword": "new-secure-password"
}
```

- **Success response:** `200 OK`

```
Password reset successfully
```

After resetting, the user's `needsPasswordReset` flag is set to `false`.

---

## 4) Import Users from CSV

### `POST /api/auth/import-users`
Bulk-import users from a CSV file. Each line should contain one email address. Passwords are auto-generated. **An email with login credentials is automatically sent to each newly created user via SMTP.**

- **Auth required:** No
- **Content-Type:** `multipart/form-data`
- **Form fields:**
  - `file` (required) — CSV file (one email per line, optional `email` header)

**Example CSV:**
```
email
alice@example.com
bob@example.com
```

- **Success response:** `200 OK`

```json
{
  "processed": 2,
  "created": 2,
  "skipped": 0,
  "failed": 0,
  "errors": []
}
```

Credentials are sent via email to each created user automatically — they are **not** included in the response.

- **Error responses:**
  - `400 Bad Request` when file is missing/empty
  - `500 Internal Server Error` when CSV read fails

---

## 5) Get All Users

### `GET /api/users`
Returns all registered users.

- **Auth required:** Yes (JWT)
- **Request body:** None
- **Success response:** `200 OK`

```json
[
  {
    "id": 1,
    "email": "alice@example.com",
    "role": "USER"
  }
]
```

---

## 6) Get User by ID

### `GET /api/users/{id}`
Returns one user by ID.

- **Auth required:** Yes (JWT)
- **Path params:**
  - `id` (number) — User ID
- **Success response:** `200 OK` (same user shape as above)
- **Error response:** `404 Not Found` when user does not exist

---

## 7) Get All Products

### `GET /api/products`
Returns all products.

- **Auth required:** Yes (JWT)
- **Request body:** None
- **Success response:** `200 OK`

```json
[
  {
    "id": 1,
    "productType": {
      "id": 1,
      "name": "Laptop"
    },
    "model": "ThinkPad X1",
    "description": "14-inch business laptop",
    "serial": "SN123456",
    "closed": false,
    "imageObjectKey": "products/1/image.jpg",
    "createdAt": "2026-02-25T12:00:00.000+00:00",
    "updatedAt": "2026-02-25T12:05:00.000+00:00",
    "actionEndDate": "2026-03-01T12:00:00.000+00:00"
  }
]
```

---

## 8) Get Product by ID

### `GET /api/products/{id}`
Returns one product by ID.

- **Auth required:** Yes (JWT)
- **Path params:**
  - `id` (number) — Product ID
- **Success response:** `200 OK` (same product shape as above)
- **Error response:** `404 Not Found` when product does not exist

---

## 9) Import Products from CSV

### `POST /api/products/import`
Imports/updates products from a CSV file.

- **Auth required:** Yes (JWT)
- **Content-Type:** `multipart/form-data`
- **Form fields:**
  - `file` (required) — CSV file

- **Success response:** `200 OK`

```json
{
  "processed": 10,
  "created": 7,
  "updated": 2,
  "failed": 1,
  "errors": ["Row 8: missing serial"]
}
```

- **Error responses:**
  - `400 Bad Request` when file is missing/empty or CSV is invalid
  - `500 Internal Server Error` when CSV read fails

---

## 10) Upload Product Image

### `POST /api/products/{id}/image`
Uploads an image for a product, stores object key, and returns a presigned URL.

- **Auth required:** Yes (JWT)
- **Content-Type:** `multipart/form-data`
- **Path params:**
  - `id` (number) — Product ID
- **Form fields:**
  - `file` (required) — Image file

- **Success response:** `200 OK`

```json
{
  "productId": "1",
  "imageObjectKey": "products/1/your-image.jpg",
  "imageUrl": "https://...presigned-url..."
}
```

- **Error responses:**
  - `400 Bad Request` when file is missing/empty
  - `404 Not Found` when product does not exist

---

## 11) Get Product Image URL

### `GET /api/products/{id}/image-url`
Returns a fresh presigned URL for the product image.

- **Auth required:** Yes (JWT)
- **Path params:**
  - `id` (number) — Product ID

- **Success response:** `200 OK`

```json
{
  "productId": "1",
  "imageObjectKey": "products/1/your-image.jpg",
  "imageUrl": "https://...presigned-url..."
}
```

- **Error responses:**
  - `404 Not Found` when product does not exist
  - `404 Not Found` with body below when product has no image:

```json
{
  "error": "Product does not have an image"
}
```

---

## 12) Close Auction

### `POST /api/products/{id}/close`
Closes the auction for a product and returns a CSV with the result (highest bidder and price).

- **Auth required:** Yes (JWT)
- **Path params:**
  - `id` (number) — Product ID
- **Success response:** `200 OK` — Returns a CSV file download

```
type, model, serial, description, starting price, email, final price
Laptop, ThinkPad X1, SN123, 14-inch laptop, 100, winner@example.com, 250
```

- **Error responses:**
  - `404 Not Found` when product does not exist
  - `400 Bad Request` when auction is already closed

---

## 13) Export Product CSV

### `GET /api/products/{id}/export`
Exports a product's details and highest bid as a CSV file.

- **Auth required:** Yes (JWT)
- **Path params:**
  - `id` (number) — Product ID
- **Success response:** `200 OK` — Returns a CSV file download (same format as close auction)
- **Error response:** `404 Not Found` when product does not exist

---

## 14) Create Bid

### `POST /api/bids`
Place a bid on a product. The authenticated user is determined from the JWT token.

- **Auth required:** Yes (JWT)
- **Request body:** JSON

```json
{
  "productId": 1,
  "price": 150.00
}
```

- **Success response:** `201 Created`

```json
{
  "id": 1,
  "price": 150.00,
  "product": { ... },
  "appUser": { ... },
  "createdAt": "2026-02-27T10:00:00.000+00:00"
}
```

- **Error responses:**
  - `400 Bad Request` when bid is invalid (e.g., auction closed, invalid product)
  - `401 Unauthorized` when not authenticated

---

## cURL Examples

### Login
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"your-password"}'
```

### Register
```bash
curl -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"your-password"}'
```

### Reset password
```bash
curl -X POST "http://localhost:8080/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","newPassword":"new-password"}'
```

### Import users CSV
```bash
curl -X POST "http://localhost:8080/api/auth/import-users" \
  -F "file=@backend/sample-data/users-example.csv"
```

### Get all users (authenticated)
```bash
curl "http://localhost:8080/api/users" \
  -H "Authorization: Bearer <token>"
```

### Get user by id (authenticated)
```bash
curl "http://localhost:8080/api/users/1" \
  -H "Authorization: Bearer <token>"
```

### Get all products (authenticated)
```bash
curl "http://localhost:8080/api/products" \
  -H "Authorization: Bearer <token>"
```

### Get product by id (authenticated)
```bash
curl "http://localhost:8080/api/products/1" \
  -H "Authorization: Bearer <token>"
```

### Import products CSV (authenticated)
```bash
curl -X POST "http://localhost:8080/api/products/import" \
  -H "Authorization: Bearer <token>" \
  -F "file=@backend/sample-data/products-example.csv"
```

### Upload product image (authenticated)
```bash
curl -X POST "http://localhost:8080/api/products/1/image" \
  -H "Authorization: Bearer <token>" \
  -F "file=@C:/path/to/image.jpg"
```

### Get product image URL (authenticated)
```bash
curl "http://localhost:8080/api/products/1/image-url" \
  -H "Authorization: Bearer <token>"
```

### Close auction (authenticated)
```bash
curl -X POST "http://localhost:8080/api/products/1/close" \
  -H "Authorization: Bearer <token>"
```

### Export product CSV (authenticated)
```bash
curl "http://localhost:8080/api/products/1/export" \
  -H "Authorization: Bearer <token>"
```

### Place a bid (authenticated)
```bash
curl -X POST "http://localhost:8080/api/bids" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"price":150.00}'
```
