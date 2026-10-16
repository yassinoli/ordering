import { randomUUID } from 'node:crypto';

export const ORDER_STATUSES = ['PENDING', 'IN_PREPARATION', 'READY', 'DELIVERED'];

const orders = new Map();

export function listOrders() {
  return [...orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrder(id) {
  return orders.get(id);
}

export function createOrder({ customerName, items }) {
  const order = {
    id: randomUUID(),
    number: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: customerName.trim(),
    items: items.map((item) => item.trim()).filter(Boolean),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  orders.set(order.id, order);
  return order;
}

export function updateOrderStatus(id, status) {
  const order = orders.get(id);
  if (!order) return undefined;
  const updated = { ...order, status, updatedAt: new Date().toISOString() };
  orders.set(id, updated);
  return updated;
}
