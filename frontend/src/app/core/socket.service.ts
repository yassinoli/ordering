import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { API_URL } from './api.config';
import { Order } from './order.model';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private readonly socket: Socket = io(API_URL, { transports: ['websocket'], auth: { token: localStorage.getItem('orderflow_token') } });

  onOrderCreated(): Observable<Order> { return this.event<Order>('order-created'); }
  onOrderUpdated(): Observable<Order> { return this.event<Order>('order-updated'); }
  onOrderReady(): Observable<Order> { return this.event<Order>('order-ready'); }
  subscribeToOrder(id: string) { this.socket.emit('join-order', id); }
  unsubscribeFromOrder(id: string) { this.socket.emit('leave-order', id); }

  private event<T>(name: string) { return new Observable<T>((subscriber) => {
    const handler = (value: T) => subscriber.next(value);
    this.socket.on(name, handler);
    return () => this.socket.off(name, handler);
  }); }
}
