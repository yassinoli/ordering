import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';
import { CreatedOrder, Order } from './order.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  list() { return this.http.get<Order[]>(`${API_URL}/api/orders`); }
  get(id: string) { return this.http.get<Order>(`${API_URL}/api/orders/${id}`); }
  create(items: string[], customerName?: string, tableNumber?: string) { return this.http.post<CreatedOrder>(`${API_URL}/api/orders`, { customerName, tableNumber, items }); }
  markReady(id: string) { return this.http.patch<Order>(`${API_URL}/api/orders/${id}/ready`, {}); }
}
