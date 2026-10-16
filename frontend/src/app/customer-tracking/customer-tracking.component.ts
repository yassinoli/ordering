import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrdersService } from '../core/orders.service';
import { SocketService } from '../core/socket.service';
import { Order } from '../core/order.model';

@Component({
  selector: 'app-customer-tracking',
  imports: [CommonModule],
  template: `
    <section *ngIf="order; else waiting" class="tracking"><p class="eyebrow">Order tracking</p><h1>{{ order.number }}</h1><p>Hi {{ order.customerName }}, your order is</p><div class="status" [class.ready]="order.status === 'READY'">{{ label(order.status) }}</div><p>{{ order.items.join(' · ') }}</p><p *ngIf="order.status === 'READY'" class="ready-message">🎉 Your order is ready for collection!</p><button *ngIf="canNotify" (click)="requestNotifications()">Enable ready notifications</button></section>
    <ng-template #waiting><p>{{ error || 'Loading your order…' }}</p></ng-template>
  `
})
export class CustomerTrackingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute); private readonly ordersApi = inject(OrdersService); private readonly socket = inject(SocketService); private readonly destroyRef = inject(DestroyRef);
  order?: Order; error = ''; orderId = ''; canNotify = 'Notification' in window && Notification.permission === 'default';
  ngOnInit() { this.orderId = this.route.snapshot.paramMap.get('id') ?? ''; if (!this.orderId) { this.error = 'Order not found.'; return; }
    this.socket.subscribeToOrder(this.orderId);
    this.ordersApi.get(this.orderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (order) => this.order = order, error: () => this.error = 'Order not found.' });
    this.socket.onOrderUpdated().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((order) => { if (order.id === this.orderId) this.order = order; });
    this.socket.onOrderReady().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((order) => { this.order = order; this.alertReady(order); });
  }
  requestNotifications() { Notification.requestPermission().then(() => this.canNotify = false); }
  label(status: string) { return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }
  private alertReady(order: Order) { this.playChime(); if ('Notification' in window && Notification.permission === 'granted') new Notification('Your order is ready!', { body: `${order.number} is ready for collection.` }); }
  private playChime() { const context = new AudioContext(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = 880; gain.gain.setValueAtTime(.08, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .5); oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .5); }
}
