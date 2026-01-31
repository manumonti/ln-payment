# API Documentation

The backend provides a RESTful API for interacting with LND nodes and the database.

## Authentication

Some endpoints require an `X-Token` header. This token is obtained after connecting to a node via the `/api/connect` endpoint.

---

## Endpoints

### 1. Connect to Node

`POST /api/connect`

Connects the application to an LND node.

**Request Body:**

```json
{
  "host": "127.0.0.1:10001",
  "cert": "HEX_ENCODED_TLS_CERT",
  "macaroon": "HEX_ENCODED_MACAROON"
}
```

**Response:**

```json
{
  "token": "SESSION_TOKEN",
  "pubkey": "NODE_PUBLIC_KEY",
  "alias": "NODE_ALIAS"
}
```

---

### 2. Create Invoice

`POST /api/invoice`

Generates a new Lightning Network invoice. Requires `X-Token`.

**Headers:**

- `X-Token`: Session token from `/api/connect`

**Request Body:**

```json
{
  "amount": 1000,
  "memo": "Payment for coffee"
}
```

**Response:**

```json
{
  "rHash": "HEX_HASH",
  "paymentRequest": "lnbc...",
  "amount": 1000,
  "memo": "Payment for coffee",
  "creationDate": "TIMESTAMP",
  "expiry": 86400
}
```

---

### 3. Get Invoice Status

`GET /api/invoice/:payment_hash`

Retrieves the status of an invoice from the database.

```json
{
  "id": "1",
  "hash": "HEX_HASH",
  "payment_request": "lnbc...",
  "amount": 1000,
  "memo": "Payment for coffee",
  "creation_date": "TIMESTAMP",
  "expiry": 86400,
  "settled": false,
  "settle_date": "TIMESTAMP" # | null
}
```

---

### 4. Pay Invoice

`POST /api/payment`

Pays a Lightning invoice. Requires `X-Token`.

**Headers:**

- `X-Token`: Session token from `/api/connect`

**Request Body:**

```json
{
  "paymentRequest": "lnbc..."
}
```

**Response:**

```json
{
  "paymentHash": "HEX_HASH"
}
```

---

### 5. Get Payment Status

`GET /api/payment/:payment_hash`

Retrieves the status of a payment from the database.

**Response:**

```json
{
  "id": 1,
  "source": "SENDER_PUBKEY",
  "destination": "RECEIVER_PUBKEY",
  "paymentHash": "HEX_HASH",
  "value": 1000,
  "memo": "Payment for coffee",
  "creation_date": "TIMESTAMP",
  "payment_preimage": "HEX_PREIMAGE",
  "payment_request": "lnbc...",
  "status": 2
}
```

> Note: Status codes: 1 (In Flight), 2 (Succeeded), 3 (Failed)

---

### 6. List Transactions

`GET /api/transactions`

Returns a list of all invoices and payments stored in the database, sorted by date.

**Response:**

```json
[
    {
        "id": 1,
        "hash": "HEX_HASH",
        "payment_request": "lnbc...",
        "amount": "1000",
        "memo": "for the services",
        "creation_date": "2026-01-31T16:31:19.000Z",
        "expiry": 86400,
        "settled": true,
        "settle_date": "2026-01-31T16:36:03.000Z",
        "type": "invoice"
    }
]
```

---

### 7. Get Balance

`GET /api/balance`

Calculates the total balance based on received invoices minus sent payments.

**Response:**

```json
{
  "totalInvoices": 5000,
  "totalPayments": 2000,
  "balance": 3000
}
```
