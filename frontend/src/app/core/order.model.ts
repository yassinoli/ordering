export type OrderStatus = 'PENDING' | 'READY' | 'COMPLETED';

export interface Order {
  id: string;
  number?: string;
  customerName?: string;
  tableNumber?: string;
  items: string[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatedOrder { orderId: string; qrCodeDataUrl: string; trackingUrl: string; order: Order; }
