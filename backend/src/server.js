import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { ORDER_STATUSES, createOrder, getOrder, listOrders, updateOrderStatus } from './orders.js';

const app = express();
const httpServer = createServer(app);
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:4200';
const io = new Server(httpServer, { cors: { origin: clientUrl, methods: ['GET', 'POST', 'PATCH'] } });

app.use(cors({ origin: clientUrl }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/orders', (_req, res) => res.json(listOrders()));
app.get('/api/orders/:id', (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

app.post('/api/orders', (req, res) => {
  const { customerName, items } = req.body ?? {};
  if (typeof customerName !== 'string' || !customerName.trim() || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: 'customerName and at least one item are required' });
  }
  const order = createOrder({ customerName, items });
  io.emit('order:created', order);
  res.status(201).json(order);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body ?? {};
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const order = updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  io.emit('order:updated', order);
  if (status === 'READY') io.to(`order:${order.id}`).emit('order:ready', order);
  res.json(order);
});

io.on('connection', (socket) => {
  socket.on('order:subscribe', (orderId) => {
    if (typeof orderId === 'string') socket.join(`order:${orderId}`);
  });
  socket.on('order:unsubscribe', (orderId) => socket.leave(`order:${orderId}`));
});

const port = Number(process.env.PORT ?? 3000);
httpServer.listen(port, () => console.log(`API and Socket.io listening on http://localhost:${port}`));
