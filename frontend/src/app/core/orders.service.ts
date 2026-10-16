import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';
import { Order, OrderStatus } from './order.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  list() { return this.http.get<Order[]>(`${API_URL}/api/orders`); }
  get(id: string) { return this.http.get<Order>(`${API_URL}/api/orders/${id}`); }
  create(customerName: string, items: string[]) { return this.http.post<Order>(`${API_URL}/api/orders`, { customerName, items }); }
  updateStatus(id: string, status: OrderStatus) { return this.http.patch<Order>(`${API_URL}/api/orders/${id}/status`, { status }); }
}
