# OrderFlow

OrderFlow is a real-time restaurant collection-alert app with an Express/Socket.io API and a dependency-free vanilla JavaScript client.

## Run locally

```powershell
cd backend
npm install
npm run dev
```

Open `http://localhost:3000/register`, then sign in at `/login`. Express serves the vanilla frontend and API from the same origin. Each restaurant only sees and manages its own orders. Customer tracking URLs (`/order/:orderId`) remain public for QR-code recipients.

## Deploy on Render

This repository includes a `render.yaml` Blueprint that deploys the vanilla frontend and Express/Socket.io API together as one web service. The app uses same-origin API and socket connections, so no public API URL or CORS configuration is needed.

1. Push this repository to GitHub.
2. In Render, select **New > Blueprint**, connect the repository, and create the Blueprint.
3. Choose a paid web-service plan: the included persistent disk is required to keep the SQLite database across redeploys and restarts.
4. After the deploy is live, open the `onrender.com` URL and register the first restaurant account.

The Blueprint installs only backend dependencies, starts the backend, creates a Render-managed `JWT_SECRET`, and stores SQLite data at `/var/data/orders.db`. Do not remove the disk unless you migrate the database to an external service.

## API

- `POST /api/auth/register` — `{ name, email, password }`; creates a restaurant account.
- `POST /api/auth/login` — `{ email, password }`; returns a JWT.
- `GET /api/orders` — authenticated; returns only the signed-in restaurant's orders.
- `GET /api/orders/:id` — public customer tracking lookup.
- `POST /api/orders` — authenticated; creates an order for the signed-in restaurant.
- `PATCH /api/orders/:orderId/ready` — authenticated; updates only an order owned by that restaurant.

Passwords are stored as bcrypt hashes. The server sends staff socket events only to the owning restaurant, while `order-ready` is sent only to that order's customer tracking room.
