# invoices

Invoice creation and lookup. Part of the Cross-Repo Review test system (iam-ms, catalog-ms, cart-ms, invoices).

## Provides

| Contract | Kind | Used by |
| --- | --- | --- |
| `POST /invoices` `{ userId, currency, lines: [{ sku, description, quantity, unitPrice }] }` | HTTP | cart-ms |
| `GET /invoices/:id`, `GET /invoices?userId=` | HTTP | clients |
| Header `x-internal-key` must equal `INTERNAL_API_KEY` | Auth | cart-ms (as `INVOICES_API_KEY`) |

## Consumes

| Contract | From | Where |
| --- | --- | --- |
| `users.email`, `users.full_name` (direct SQL on the IAM database, no API) | iam-ms | `billing/customerLookup.js` |
| Env var `IAM_DATABASE_URL` | deployment | `db/iamPool.js` |

Reading another service's tables directly is a deliberate hidden coupling, kept here to test database-level detection.

## Run

```bash
cp .env.example .env
npm install
npm run migrate
npm start
```
