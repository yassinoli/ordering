import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { Server } from 'socket.io';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createOrder, createRestaurant, getOrder, getRestaurant, getRestaurantByEmail, listOrders, updateOrderStatus } from './orders.js';

const app = express();
const httpServer = createServer(app);
const backendDirectory = dirname(fileURLToPath(import.meta.url));
const clientBuildDirectory = resolve(backendDirectory, '../../frontend/dist/restaurant-orders-web/browser');
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:4200';
const jwtSecret = process.env.JWT_SECRET ?? 'change-this-secret-before-deploying';
const io = new Server(httpServer, { cors: { origin: clientUrl, methods: ['GET', 'POST', 'PATCH'] } });

app.use(cors({ origin: clientUrl }));
app.use(express.json());

const tokenFor = (restaurant) => jwt.sign({ restaurantId: restaurant.id }, jwtSecret, { expiresIn: '7d' });
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  try { req.restaurant = jwt.verify(token, jwtSecret); next(); }
  catch { res.status(401).json({ message: 'Please sign in to continue.' }); }
};

app.get('/health', (_req, res) => res.json({ ok: true }));
app.post('/api/auth/register', async (req, res, next) => {
  const { name, email, password } = req.body ?? {};
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) return res.status(400).json({ message: 'Restaurant name, email, and a password of at least 8 characters are required.' });
  if (getRestaurantByEmail(email)) return res.status(409).json({ message: 'An account with that email already exists.' });
  try { const restaurant = createRestaurant({ name, email, passwordHash: await bcrypt.hash(password, 12) }); return res.status(201).json({ token: tokenFor(restaurant), restaurant: getRestaurant(restaurant.id) }); } catch (error) { next(error); }
});
app.post('/api/auth/login', async (req, res, next) => {
  const { email, password } = req.body ?? {}; const restaurant = email && getRestaurantByEmail(email);
  try { if (!restaurant || !password || !(await bcrypt.compare(password, restaurant.password_hash))) return res.status(401).json({ message: 'Email or password is incorrect.' }); return res.json({ token: tokenFor(restaurant), restaurant: getRestaurant(restaurant.id) }); } catch (error) { next(error); }
});
app.get('/api/auth/me', requireAuth, (req, res) => res.json(getRestaurant(req.restaurant.restaurantId)));
app.get('/api/orders', requireAuth, (req, res) => res.json(listOrders(req.restaurant.restaurantId)));
app.get('/api/orders/:id', (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

app.post('/api/orders', requireAuth, async (req, res, next) => {
  const { customerName, tableNumber, items } = req.body ?? {};
  if ((!customerName?.trim() && !tableNumber?.trim()) || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: 'A customer name or table number and at least one item are required' });
  }
  const order = createOrder({ restaurantId: req.restaurant.restaurantId, customerName, tableNumber, items });
  const frontendUrl = process.env.FRONTEND_URL ?? clientUrl;
  try {
    const trackingUrl = `${frontendUrl.replace(/\/$/, '')}/order/${order.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, { width: 320, margin: 2 });
    io.to(`restaurant:${order.restaurantId}`).emit('order-created', order);
    return res.status(201).json({ orderId: order.id, qrCodeDataUrl, trackingUrl, order });
  } catch (error) { return next(error); }
});

app.patch('/api/orders/:orderId/ready', requireAuth, (req, res) => {
  const order = updateOrderStatus(req.params.orderId, req.restaurant.restaurantId, 'READY');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  io.to(`restaurant:${order.restaurantId}`).emit('order-updated', order);
  io.to(order.id).emit('order-ready', order);
  res.json(order);
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next();
  try { socket.restaurant = jwt.verify(token, jwtSecret); } catch { /* Public customer connections do not need a token. */ }
  next();
});
io.on('connection', (socket) => {
  if (socket.restaurant?.restaurantId) socket.join(`restaurant:${socket.restaurant.restaurantId}`);
  socket.on('join-order', (orderId) => {
    if (typeof orderId === 'string') socket.join(orderId);
  });
  socket.on('leave-order', (orderId) => socket.leave(orderId));
});

// Render runs this service as both the API and the Angular host. This is only
// available after `npm run build` has produced the frontend bundle.
if (existsSync(clientBuildDirectory)) {
  app.use(express.static(clientBuildDirectory));
  app.get('{*path}', (_req, res) => res.sendFile(resolve(clientBuildDirectory, 'index.html')));
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Could not create QR code' });
});

const port = Number(process.env.PORT ?? 3000);
httpServer.listen(port, () => console.log(`API and Socket.io listening on http://localhost:${port}`));
