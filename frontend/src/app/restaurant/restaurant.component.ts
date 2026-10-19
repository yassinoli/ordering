import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreatedOrder, Order } from '../core/order.model';
import { OrdersService } from '../core/orders.service';
import { SocketService } from '../core/socket.service';

@Component({ selector: 'app-restaurant-dashboard', imports: [CommonModule, FormsModule], template: `
  <section class="page-heading"><p class="eyebrow">Kitchen command center</p><h1>Staff dashboard</h1><p>Create an order, hand over its QR code, then notify the guest when it is ready.</p></section>
  <section class="create-order"><h2>Create order</h2><form (ngSubmit)="createOrder()"><input [(ngModel)]="customerName" name="customerName" placeholder="Customer name"><input [(ngModel)]="tableNumber" name="tableNumber" placeholder="or table number"><input [(ngModel)]="itemsText" name="items" placeholder="Items, comma separated" required><button [disabled]="creating()">{{ creating() ? 'Creating...' : 'Create & show QR' }}</button></form><p class="error" *ngIf="error()">{{ error() }}</p></section>
  <section class="qr-card" *ngIf="created() as result"><div><p class="eyebrow">Share with guest</p><h2>{{ result.order.customerName || 'Table ' + result.order.tableNumber }}</h2><a [href]="result.trackingUrl" target="_blank" rel="noopener">Open tracking page</a></div><img [src]="result.qrCodeDataUrl" alt="QR code for this order's tracking page"><button type="button" (click)="printQr()">Print QR</button></section>
  <section class="orders"><div class="section-title"><h2>Active pending orders</h2><span>{{ pendingOrders().length }}</span></div><p *ngIf="loading()">Loading orders...</p><article class="card" *ngFor="let order of pendingOrders()"><div><strong>{{ order.customerName || 'Table ' + order.tableNumber }}</strong><small>{{ order.items.join(' · ') }}</small><small>Created {{ order.createdAt | date:'shortTime' }}</small></div><button (click)="markReady(order.id)">Mark as Ready</button></article><p class="empty" *ngIf="!loading() && !pendingOrders().length">No pending orders.</p></section>
` })
export class RestaurantComponent {
  private readonly api = inject(OrdersService); private readonly socket = inject(SocketService); private readonly destroyRef = inject(DestroyRef);
  readonly orders = signal<Order[]>([]); readonly loading = signal(true); readonly creating = signal(false); readonly error = signal(''); readonly created = signal<CreatedOrder | null>(null);
  readonly pendingOrders = computed(() => this.orders().filter(order => order.status === 'PENDING'));
  customerName = ''; tableNumber = ''; itemsText = '';
  constructor() { this.api.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: orders => { this.orders.set(orders); this.loading.set(false); }, error: () => { this.error.set('Could not reach the API.'); this.loading.set(false); } }); this.socket.onOrderCreated().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(order => this.upsert(order)); this.socket.onOrderUpdated().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(order => this.upsert(order)); }
  createOrder() { const items = this.itemsText.split(',').map(item => item.trim()).filter(Boolean); if (!items.length || (!this.customerName.trim() && !this.tableNumber.trim())) { this.error.set('Add items and a customer name or table number.'); return; } this.creating.set(true); this.error.set(''); this.api.create(items, this.customerName, this.tableNumber).subscribe({ next: result => { this.created.set(result); this.customerName = ''; this.tableNumber = ''; this.itemsText = ''; this.creating.set(false); }, error: () => { this.error.set('Unable to create order.'); this.creating.set(false); } }); }
  markReady(id: string) { this.api.markReady(id).subscribe({ error: () => this.error.set('Unable to mark that order ready.') }); }
  printQr() { window.print(); }
  private upsert(updated: Order) { this.orders.update(orders => { const index = orders.findIndex(order => order.id === updated.id); return index < 0 ? [updated, ...orders] : orders.map(order => order.id === updated.id ? updated : order); }); }
}
