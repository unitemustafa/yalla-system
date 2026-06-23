# Yalla Market API Contract

This document defines the REST API contract expected by the Flutter app. The
mobile, desktop, and web clients call `API_BASE_URL/api/v1`, where
`API_BASE_URL` is provided with `--dart-define` or `--dart-define-from-file`.

## Response Envelope

Successful responses may be wrapped in `data`.

```json
{
  "data": {}
}
```

The app also accepts direct JSON payloads for backend compatibility. The local
Django backend currently returns auth payloads directly, for example:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "expiresIn": 900,
  "user": {}
}
```

All failed responses use the same shape.

```json
{
  "message": "Human readable error",
  "code": "ERROR_CODE",
  "fields": {
    "email": "Email is already registered"
  }
}
```

`fields` may be omitted when the error is not tied to form fields. The app maps
HTTP 401 to an unauthenticated state after refresh token recovery fails.

## Authentication

Authenticated requests use:

```http
Authorization: Bearer <accessToken>
```

Token payloads should include an ISO-8601 expiry value.

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "expiresAt": "2026-05-16T18:00:00.000Z"
}
```

The app can also accept `expiresIn` in seconds if `expiresAt` is not available.
The local Django backend uses `expiresIn`.

### POST `/auth/signup`

Request:

```json
{
  "firstName": "Mustafa",
  "lastName": "Ali",
  "email": "mustafa@example.com",
  "password": "password",
  "username": "mustafa",
  "phone": "+201000000000"
}
```

Response when the backend signs the user in immediately:

```json
{
  "data": {
    "user": {
      "id": "user_1",
      "email": "mustafa@example.com",
      "firstName": "Mustafa",
      "lastName": "Ali",
      "role": "CUSTOMER",
      "hasPassword": true,
      "username": "mustafa",
      "phone": "+201000000000",
      "avatarUrl": null,
      "gender": null,
      "birthDate": null,
      "usernameChangedAt": null
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "expiresAt": "2026-05-16T18:00:00.000Z"
    }
  }
}
```

The app also accepts token fields directly beside `user`.

When email verification is required before sign in, tokens may be omitted:

```json
{
  "data": {
    "email": "mustafa@example.com",
    "message": "Verification email sent"
  }
}
```

The app will show the email verification screen after either successful shape.
The local Django backend returns `email` directly plus `dev_otp` while `DEBUG`
is enabled.

### POST `/auth/verify-email`

Request:

```json
{
  "email": "mustafa@example.com",
  "code": "123456"
}
```

Response: same as login, including `user` and tokens. The app stores these
tokens for the current app session unless the customer later signs in with
`rememberMe`.

The local Django backend accepts `code` as an alias for `otp`.

### POST `/auth/resend-verification`

Request:

```json
{
  "email": "mustafa@example.com"
}
```

Response:

```json
{
  "data": true
}
```

### POST `/auth/login`

Request:

```json
{
  "email": "mustafa@example.com",
  "password": "password",
  "rememberMe": true
}
```

Response: same as signup.

### POST `/auth/refresh`

Request:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Response:

```json
{
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token",
    "expiresAt": "2026-05-16T19:00:00.000Z"
  }
}
```

### POST `/auth/logout`

Request:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Response:

```json
{
  "data": true
}
```

### GET `/auth/me`

Response:

```json
{
  "data": {
    "id": "user_1",
    "email": "mustafa@example.com",
    "firstName": "Mustafa",
    "lastName": "Ali",
    "role": "CUSTOMER",
    "hasPassword": true
  }
}
```

The app also accepts `{ "user": {} }`, which is what the local Django backend
returns.

### PATCH `/auth/me`

Request supports partial updates:

```json
{
  "firstName": "Mustafa",
  "lastName": "Ali",
  "username": "mustafa",
  "email": "mustafa@example.com",
  "phone": "+201000000000",
  "gender": "male",
  "birthDate": "1998-01-01"
}
```

Response: updated user in `data`.

### DELETE `/auth/me`

Request:

```json
{
  "password": "password"
}
```

Response:

```json
{
  "data": true
}
```

### Availability Checks

- GET `/auth/check-username?username=mustafa`
- GET `/auth/check-email?email=mustafa@example.com`
- GET `/auth/check-phone?phone=%2B201000000000`

Response:

```json
{
  "data": {
    "available": true,
    "registered": false
  }
}
```

For email and phone, the app accepts either `registered` or `exists`.

## Products

### GET `/products`

Supported query parameters:

- `query`
- `category`
- `brand`
- `sort`
- `page`
- `pageSize`
- `city` - optional city slug such as `sharm-el-sheikh`. When present, return
  products available in that city. If the city is missing or unsupported, keep
  the existing default behavior.

Response:

```json
{
  "data": [
    {
      "id": "product_1",
      "slug": "running-shoe",
      "image": "https://cdn.example.com/products/product_1.png",
      "title": "Running Shoe",
      "brand": "Brand",
      "price": "1200 EGP",
      "oldPrice": "1500 EGP",
      "discount": "20%",
      "tags": ["shoes", "sport"],
      "citySlug": "sharm-el-sheikh",
      "cityName": "Sharm El Sheikh"
    }
  ]
}
```

The app also accepts `{ "data": { "items": [...] } }`.

### GET `/products/search`

Supported query parameters:

- `query`
- `category`
- `brand`
- `page`
- `pageSize`
- `city`

Response: product list in `data` or `{ "data": { "items": [...] } }`.

### GET `/products/{idOrSlug}`

Response: one product object in `data`.

### GET `/categories`

Response:

```json
{
  "data": [
    {
      "id": "cat_1",
      "name": "Shoes",
      "slug": "shoes"
    }
  ]
}
```

### GET `/brands`

Response:

```json
{
  "data": [
    {
      "id": "brand_1",
      "name": "Brand",
      "slug": "brand"
    }
  ]
}
```

## Cart

Cart item shape:

```json
{
  "id": "cart_item_1",
  "productId": "product_1",
  "variantId": "variant_1",
  "image": "https://cdn.example.com/products/product_1.png",
  "brand": "Brand",
  "title": "Running Shoe",
  "price": 1200,
  "quantity": 2,
  "attributes": [
    {
      "label": "Size",
      "value": "42"
    }
  ]
}
```

The app accepts a cart response as either a list in `data` or
`{ "data": { "items": [...] } }`.

### GET `/cart`

Response: cart items.

### POST `/cart/items`

Request:

```json
{
  "item": {
    "productId": "product_1",
    "variantId": "variant_1"
  },
  "quantity": 1
}
```

Response: updated cart items.

### POST `/cart/items/{id}/increment`

Response: updated cart items.

### POST `/cart/items/{id}/decrement`

Response: updated cart items.

### DELETE `/cart/items/{id}`

Response: updated cart items.

### DELETE `/cart`

Response: updated cart items, usually an empty list.

## Wishlist

Wishlist item shape:

```json
{
  "image": "https://cdn.example.com/products/product_1.png",
  "title": "Running Shoe",
  "brand": "Brand",
  "price": "1200 EGP",
  "oldPrice": "1500 EGP",
  "discount": "20%"
}
```

### GET `/wishlist`

Response: wishlist items as a list in `data` or `{ "data": { "items": [...] } }`.

### POST `/wishlist/items/toggle`

Request:

```json
{
  "item": {
    "title": "Running Shoe",
    "brand": "Brand",
    "price": "1200 EGP"
  }
}
```

Response: updated wishlist items.

## Addresses

Address shape:

```json
{
  "id": "address_1",
  "fullName": "Mustafa Ali",
  "phone": "+201000000000",
  "line1": "12 Tahrir St",
  "city": "Cairo",
  "state": "Cairo",
  "country": "Egypt",
  "postalCode": "11511",
  "isDefault": true
}
```

The app also accepts `name` instead of `fullName`, `phoneNumber` instead of
`phone`, and `street` instead of `line1`.

### GET `/addresses`

Response: address list in `data` or `{ "data": { "items": [...] } }`.

### GET `/addresses/default`

Response: selected/default address in `data`, or `null` if the customer has no
saved addresses.

### POST `/addresses`

Request:

```json
{
  "fullName": "Mustafa Ali",
  "phone": "+201000000000",
  "line1": "12 Tahrir St",
  "city": "Cairo",
  "state": "Cairo",
  "country": "Egypt",
  "postalCode": "11511",
  "isDefault": false
}
```

Response: updated address list.

### PATCH `/addresses/{id}`

Request: same shape as create, partial updates are allowed.

Response: updated address list.

### PATCH `/addresses/{id}/default`

Response: updated address list with exactly one address marked `isDefault`.

### DELETE `/addresses/{id}`

Response: updated address list.

## Orders

Yalla Market v1 supports cash on delivery only. Reject any other payment method
with HTTP 422 and code `UNSUPPORTED_PAYMENT_METHOD`.

### POST `/orders`

Request:

```json
{
  "shippingAddress": {
    "fullName": "Mustafa Ali",
    "phone": "+201000000000",
    "line1": "12 Tahrir St",
    "city": "Cairo",
    "state": "Cairo",
    "country": "Egypt",
    "postalCode": "11511"
  },
  "items": [
    {
      "id": "cart_item_1",
      "productId": "product_1",
      "variantId": "variant_1",
      "image": "https://cdn.example.com/products/product_1.png",
      "brand": "Brand",
      "title": "Running Shoe",
      "unitPrice": 1200,
      "quantity": 2,
      "attributes": []
    }
  ],
  "paymentMethod": "cash_on_delivery",
  "shippingFee": 50,
  "taxTotal": 0,
  "discountTotal": 0
}
```

Response:

```json
{
  "data": {
    "id": "order_1",
    "orderNumber": "YM-10001",
    "status": "pending",
    "placedAt": "2026-05-16T15:00:00.000Z",
    "estimatedDeliveryAt": "2026-05-20T15:00:00.000Z",
    "shippingAddress": {
      "fullName": "Mustafa Ali",
      "phone": "+201000000000",
      "line1": "12 Tahrir St",
      "city": "Cairo",
      "state": "Cairo",
      "country": "Egypt",
      "postalCode": "11511"
    },
    "paymentMethod": "cash_on_delivery",
    "items": [],
    "subtotal": 2400,
    "shippingFee": 50,
    "taxTotal": 0,
    "discountTotal": 0,
    "total": 2450
  }
}
```

### GET `/orders`

Response: order list in `data` or `{ "data": { "items": [...] } }`.
