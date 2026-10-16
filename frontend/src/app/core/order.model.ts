export type OrderStatus = 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED';

export interface Order {
  id: string;
  number: string;
  customerName: string;
  items: string[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
