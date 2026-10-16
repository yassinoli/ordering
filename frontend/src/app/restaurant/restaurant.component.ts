import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrdersService } from '../core/orders.service';
import { SocketService } from '../core/socket.service';
import { Order, OrderStatus } from '../core/order.model';

@Component({
  selector: 'app-restaurant',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-heading"><div><p class="eyebrow">Live kitchen board</p><h1>Restaurant dashboard</h1><p>Incoming orders update instantly across every open dashboard.</p></div></section>
    <section class="create-order"><h2>New test order</h2><form (ngSubmit)="createOrder()"><input [(ngModel)]="customerName" name="customerName" placeholder="Customer name" required><input [(ngModel)]="itemsText" name="items" placeholder="Items, comma separated" required><button>Create order</button></form><p *ngIf="createdOrder">Tracking link: <a [href]="trackingUrl(createdOrder.id)" target="_blank">{{ trackingUrl(createdOrder.id) }}</a></p></section>
    <p *ngIf="loading">Loading orders…</p><p class="error" *ngIf="error">{{ error }}</p>
    <section class="board" *ngIf="!loading">
      <article class="column" *ngFor="let status of statuses"><h2>{{ label(status) }} <span>{{ ordersFor(status).length }}</span></h2><div class="card" *ngFor="let order of ordersFor(status)"><strong>{{ order.number }}</strong><span>{{ order.customerName }}</span><small>{{ order.items.join(', ') }}</small><label>Move to <select [ngModel]="order.status" (ngModelChange)="changeStatus(order, $event)"><option *ngFor="let option of statuses" [value]="option">{{ label(option) }}</option></select></label></div><p class="empty" *ngIf="!ordersFor(status).length">No orders</p></article>
    </section>
  `
})
export class RestaurantComponent implements OnInit {
  private readonly ordersApi = inject(OrdersService); private readonly socket = inject(SocketService); private readonly destroyRef = inject(DestroyRef);
  readonly statuses: OrderStatus[] = ['PENDING', 'IN_PREPARATION', 'READY', 'DELIVERED'];
  orders: Order[] = []; loading = true; error = ''; customerName = ''; itemsText = ''; createdOrder?: Order;
  ngOnInit() {
    this.ordersApi.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (orders) => { this.orders = orders; this.loading = false; }, error: () => { this.error = 'Could not reach the API.'; this.loading = false; } });
    this.socket.onOrderCreated().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((order) => this.upsert(order));
    this.socket.onOrderUpdated().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((order) => this.upsert(order));
  }
  createOrder() { const items = this.itemsText.split(',').map((item) => item.trim()).filter(Boolean); this.ordersApi.create(this.customerName, items).subscribe({ next: (order) => { this.createdOrder = order; this.customerName = ''; this.itemsText = ''; }, error: () => this.error = 'Unable to create order.' }); }
  changeStatus(order: Order, status: OrderStatus) { if (status === order.status) return; this.ordersApi.updateStatus(order.id, status).subscribe({ error: () => this.error = 'Unable to update order.' }); }
  ordersFor(status: OrderStatus) { return this.orders.filter((order) => order.status === status); }
  label(status: OrderStatus) { return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }
  trackingUrl(id: string) { return `${location.origin}/track/${id}`; }
  private upsert(updated: Order) { const index = this.orders.findIndex((order) => order.id === updated.id); if (index < 0) this.orders = [updated, ...this.orders]; else this.orders = this.orders.map((order) => order.id === updated.id ? updated : order); }
}
