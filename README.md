# Restaurant Orders

Real-time restaurant order dashboard and customer tracking page built with Express, Socket.io, and Angular.

## Structure

```
ordering/
  backend/       Express REST API and Socket.io server
  frontend/      Angular customer and restaurant application
```

## Run locally

Prerequisite: Node.js 22.22.3 or later (required by Angular 22).

1. In one terminal, start the API:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

   It listens at `http://localhost:3000`.

2. In another terminal, start Angular:

   ```powershell
   cd frontend
   npm install
   npm start
   ```

3. Open `http://localhost:4200/restaurant` to manage orders. Create a sample order there, then open `http://localhost:4200/track/<order-id>` on another browser/device. When the dashboard marks it ready, the tracking view receives an immediate visual/audio alert and (when permission is granted) a browser notification.

For a phone on the same Wi-Fi network, replace `localhost` in `frontend/src/app/core/api.config.ts` with the computer's LAN IP, run `npm start -- --host 0.0.0.0`, and visit that LAN address from the phone. Browser notifications require HTTPS on most mobile browsers (or localhost); use a trusted HTTPS tunnel/deployment for production.

## API

- `GET /api/orders` — list all orders
- `GET /api/orders/:id` — get one order
- `POST /api/orders` — create `{ customerName, items }`
- `PATCH /api/orders/:id/status` — update `{ status }`

Valid statuses are `PENDING`, `IN_PREPARATION`, `READY`, and `DELIVERED`.

Socket.io events: clients emit `order:subscribe` with an order ID; the server emits `order:created`, `order:updated`, and `order:ready` (the last one is sent to the tracked order's room).

## Production notes

This demo stores orders in memory, so they reset when the server restarts. Add a database, authentication/authorization for the restaurant routes, validation/rate limits, and a push-notification service (FCM/APNs or Web Push) for reliable background phone notifications.
