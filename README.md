# OrderFlow

OrderFlow is a real-time restaurant collection-alert app with an Express/Socket.io API and Angular client.

## Run locally

```powershell
cd backend
npm install
npm run dev
```

In another terminal:

```powershell
cd frontend
npm install
npm start
```

Create a restaurant account at `http://localhost:4200/register`, then sign in at `/login`. Each restaurant only sees and manages its own orders. Customer tracking URLs (`/order/:orderId`) remain public for QR-code recipients.

## Hosting configuration

The API persists restaurant accounts and orders in SQLite at `backend/data/orders.db` by default. This database is ignored by Git, so place it on a persistent volume when hosting.

Set these backend environment variables:

```text
DATABASE_PATH=/persistent-volume/orders.db
JWT_SECRET=use-a-long-random-secret-here
CLIENT_URL=https://your-frontend-domain.example
FRONTEND_URL=https://your-frontend-domain.example
PORT=3000
```

Build the frontend with `npm run build` inside `frontend`, deploy the generated `dist` directory as a static site, and change `frontend/src/app/core/api.config.ts` to your public HTTPS API URL before building. Deploy the backend as a persistent Node service; SQLite will not survive on ephemeral serverless storage.

## API

- `POST /api/auth/register` — `{ name, email, password }`; creates a restaurant account.
- `POST /api/auth/login` — `{ email, password }`; returns a JWT.
- `GET /api/orders` — authenticated; returns only the signed-in restaurant's orders.
- `GET /api/orders/:id` — public customer tracking lookup.
- `POST /api/orders` — authenticated; creates an order for the signed-in restaurant.
- `PATCH /api/orders/:orderId/ready` — authenticated; updates only an order owned by that restaurant.

Passwords are stored as bcrypt hashes. The server sends staff socket events only to the owning restaurant, while `order-ready` is sent only to that order's customer tracking room.
