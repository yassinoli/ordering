export const ORDER_STATUSES = ['PENDING', 'READY', 'COMPLETED'];
import { randomUUID } from 'node:crypto';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import Database from 'better-sqlite3';

const databasePath = process.env.DATABASE_PATH ?? 'data/orders.db';
mkdirSync(dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, restaurant_id TEXT NOT NULL, customer_name TEXT,
    table_number TEXT, items TEXT NOT NULL, status TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
  );
  CREATE INDEX IF NOT EXISTS orders_restaurant_created ON orders(restaurant_id, created_at DESC);
`);

const toOrder = (row) => row && ({
  id: row.id, restaurantId: row.restaurant_id, customerName: row.customer_name || undefined,
  tableNumber: row.table_number || undefined, items: JSON.parse(row.items), status: row.status,
  createdAt: row.created_at, updatedAt: row.updated_at
});

export function createRestaurant({ name, email, passwordHash }) {
  const restaurant = { id: randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), passwordHash, createdAt: new Date().toISOString() };
  db.prepare('INSERT INTO restaurants (id, name, email, password_hash, created_at) VALUES (@id, @name, @email, @passwordHash, @createdAt)').run(restaurant);
  return restaurant;
}
export function getRestaurantByEmail(email) {
  return db.prepare('SELECT * FROM restaurants WHERE email = ?').get(email.trim().toLowerCase());
}
export function getRestaurant(id) {
  const restaurant = db.prepare('SELECT id, name, email, created_at FROM restaurants WHERE id = ?').get(id);
  return restaurant && ({ id: restaurant.id, name: restaurant.name, email: restaurant.email, createdAt: restaurant.created_at });
}
export function listOrders(restaurantId) {
  return db.prepare('SELECT * FROM orders WHERE restaurant_id = ? ORDER BY created_at DESC').all(restaurantId).map(toOrder);
}
export function getOrder(id) { return toOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(id)); }
export function createOrder({ restaurantId, customerName, tableNumber, items }) {
  const now = new Date().toISOString();
  const order = { id: randomUUID(), restaurantId, customerName: customerName?.trim() || null, tableNumber: tableNumber?.trim() || null, items: JSON.stringify(items.map((item) => item.trim()).filter(Boolean)), status: 'PENDING', createdAt: now, updatedAt: now };
  db.prepare('INSERT INTO orders (id, restaurant_id, customer_name, table_number, items, status, created_at, updated_at) VALUES (@id, @restaurantId, @customerName, @tableNumber, @items, @status, @createdAt, @updatedAt)').run(order);
  return toOrder({ ...order, restaurant_id: restaurantId, customer_name: order.customerName, table_number: order.tableNumber, created_at: now, updated_at: now });
}
export function updateOrderStatus(id, restaurantId, status) {
  const result = db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ? AND restaurant_id = ?').run(status, new Date().toISOString(), id, restaurantId);
  return result.changes ? getOrder(id) : undefined;
}
