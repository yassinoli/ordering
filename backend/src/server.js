import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import QRCode from 'qrcode';
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

app.post('/api/orders', async (req, res, next) => {
  const { customerName, tableNumber, items } = req.body ?? {};
  if ((!customerName?.trim() && !tableNumber?.trim()) || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: 'A customer name or table number and at least one item are required' });
  }
  const order = createOrder({ customerName, tableNumber, items });
  const frontendUrl = process.env.FRONTEND_URL ?? clientUrl;
  try {
    const trackingUrl = `${frontendUrl.replace(/\/$/, '')}/order/${order.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, { width: 320, margin: 2 });
    io.emit('order-created', order);
    return res.status(201).json({ orderId: order.id, qrCodeDataUrl, trackingUrl, order });
  } catch (error) { return next(error); }
});

app.patch('/api/orders/:orderId/ready', (req, res) => {
  const order = updateOrderStatus(req.params.orderId, 'READY');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  io.emit('order-updated', order);
  io.to(order.id).emit('order-ready', order);
  res.json(order);
});

io.on('connection', (socket) => {
  socket.on('join-order', (orderId) => {
    if (typeof orderId === 'string') socket.join(orderId);
  });
  socket.on('leave-order', (orderId) => socket.leave(orderId));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Could not create QR code' });
});

const port = Number(process.env.PORT ?? 3000);
httpServer.listen(port, () => console.log(`API and Socket.io listening on http://localhost:${port}`));
