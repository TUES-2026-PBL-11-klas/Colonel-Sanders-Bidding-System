# API Documentation

Base URL (local): `http://localhost:8080`

## Authentication

- Auth style: JWT-based login endpoint exists.
- Current access policy in `SecurityConfig`: all `/api/auth/**` and `/api/products/**` endpoints are currently public (`permitAll`).
- `POST /api/auth/login` returns a JWT token for clients that want to use token auth.

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
  "token": "<jwt-token>"
}
```

- **Possible error responses:**
  - `401 Unauthorized` when credentials are invalid
  - `500 Internal Server Error` if user lookup fails unexpectedly after authentication

---

## 2) Get All Products

### `GET /api/products`
Returns all products.

- **Auth required:** No
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

## 3) Get Product by ID

### `GET /api/products/{id}`
Returns one product by ID.

- **Auth required:** No
- **Path params:**
  - `id` (number) — Product ID
- **Success response:** `200 OK` (same product shape as above)
- **Error response:** `404 Not Found` when product does not exist

---

## 4) Import Products from CSV

### `POST /api/products/import`
Imports/updates products from a CSV file.

- **Auth required:** No
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

## 5) Upload Product Image

### `POST /api/products/{id}/image`
Uploads an image for a product, stores object key, and returns a presigned URL.

- **Auth required:** No
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

## 6) Get Product Image URL

### `GET /api/products/{id}/image-url`
Returns a fresh presigned URL for the product image.

- **Auth required:** No
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

## cURL Examples

### Login
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"your-password"}'
```

### Get all products
```bash
curl "http://localhost:8080/api/products"
```

### Get product by id
```bash
curl "http://localhost:8080/api/products/1"
```

### Import products CSV
```bash
curl -X POST "http://localhost:8080/api/products/import" \
  -F "file=@backend/sample-data/products-example.csv"
```

### Upload product image
```bash
curl -X POST "http://localhost:8080/api/products/1/image" \
  -F "file=@C:/path/to/image.jpg"
```

### Get product image URL
```bash
curl "http://localhost:8080/api/products/1/image-url"
```
