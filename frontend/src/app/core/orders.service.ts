import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';
import { CreatedOrder, Order } from './order.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private get options() { return { headers: { Authorization: `Bearer ${this.auth.token}` } }; }
  list() { return this.http.get<Order[]>(`${API_URL}/api/orders`, this.options); }
  get(id: string) { return this.http.get<Order>(`${API_URL}/api/orders/${id}`); }
  create(items: string[], customerName?: string, tableNumber?: string) { return this.http.post<CreatedOrder>(`${API_URL}/api/orders`, { customerName, tableNumber, items }, this.options); }
  markReady(id: string) { return this.http.patch<Order>(`${API_URL}/api/orders/${id}/ready`, {}, this.options); }
}
