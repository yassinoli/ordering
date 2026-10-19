# OrderFlow

Real-time restaurant collection alerts with an Express/Socket.io API and an Angular standalone + Signals client.

## Run

Start the API in one terminal:

```powershell
cd backend
npm install
npm run dev
```

Start the Angular app in another:

```powershell
cd frontend
npm install
npm start
```

Open `http://localhost:4200/dashboard`. Create an order, give the guest the generated QR code, and open its `/order/:orderId` URL. The guest must press **I'm waiting for my order — Enable Alerts** once to satisfy browser audio policies. Marking the order ready then emits a private Socket.io room event, runs a repeated Web Audio buzzer, vibrates compatible devices, and displays a full-screen acknowledgement overlay.

## API

- `GET /api/orders` — all in-memory orders
- `GET /api/orders/:id` — one order
- `POST /api/orders` — body: `{ items, customerName? , tableNumber? }`; returns `{ orderId, qrCodeDataUrl, trackingUrl, order }`
- `PATCH /api/orders/:orderId/ready` — marks the order `READY` and notifies that order's room

The server uses `FRONTEND_URL` (defaults to `http://localhost:4200`) when generating QR tracking URLs. Set `CLIENT_URL` too if the browser app is served from a different origin. Orders are deliberately in-memory for this demo and reset when the backend restarts.

## Socket contract

Clients emit `join-order` / `leave-order` with an `orderId`. The API broadcasts `order-created` and `order-updated` to staff clients, and sends `order-ready` only to the matching order room.
