import { Component, DestroyRef, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Order } from '../core/order.model';
import { OrdersService } from '../core/orders.service';
import { SocketService } from '../core/socket.service';

@Component({ selector: 'app-customer-tracking', imports: [CommonModule], template: `
  <section class="tracking" *ngIf="order() as current; else state"><p class="eyebrow">Your order</p><h1>{{ current.customerName || 'Table ' + current.tableNumber }}</h1><p>{{ current.items.join(' · ') }}</p><div class="status" [class.ready]="current.status === 'READY'">{{ current.status === 'READY' ? 'Order dyalk wjed! Aji khdo!' : 'L-khedma f l-kuzina... Sme7 lina f-l-audio' }}</div><button class="alert-enable" *ngIf="!alertsEnabled()" (click)="enableAlerts()">I'm waiting for my order — Enable Alerts</button><p *ngIf="alertsEnabled() && current.status !== 'READY'" class="muted">Alerts are enabled. Keep this page open.</p></section>
  <ng-template #state><section class="tracking"><p>{{ error() || 'Loading your order...' }}</p></section></ng-template>
  <div class="ready-overlay" *ngIf="alarmActive()"><div><p class="eyebrow">Order ready</p><h2>Order dyalk wjed! Aji khdo!</h2><p>Your kitchen is calling you.</p><button (click)="acknowledge()">Stop Sound / Acknowledge</button></div></div>
` })
export class CustomerTrackingComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute); private readonly api = inject(OrdersService); private readonly socket = inject(SocketService); private readonly destroyRef = inject(DestroyRef);
  readonly order = signal<Order | null>(null); readonly error = signal(''); readonly alertsEnabled = signal(false); readonly alarmActive = signal(false); private orderId = ''; private audio?: AudioContext; private timer?: number;
  constructor() { this.orderId = this.route.snapshot.paramMap.get('orderId') ?? ''; if (!this.orderId) { this.error.set('Order not found.'); return; } this.socket.subscribeToOrder(this.orderId); this.api.get(this.orderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: order => this.order.set(order), error: () => this.error.set('Order not found.') }); this.socket.onOrderReady().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(order => { if (order.id === this.orderId) { this.order.set(order); if (this.alertsEnabled()) this.startAlarm(); } }); this.socket.onOrderUpdated().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(order => { if (order.id === this.orderId) this.order.set(order); }); }
  async enableAlerts() { try { this.audio = new AudioContext(); await this.audio.resume(); this.alertsEnabled.set(true); if (this.order()?.status === 'READY') this.startAlarm(); } catch { this.error.set('Your browser could not enable sound.'); } }
  acknowledge() { this.alarmActive.set(false); if (this.timer) window.clearInterval(this.timer); this.timer = undefined; navigator.vibrate?.(0); }
  ngOnDestroy() { this.acknowledge(); if (this.orderId) this.socket.unsubscribeFromOrder(this.orderId); this.audio?.close(); }
  private startAlarm() { if (this.alarmActive()) return; this.alarmActive.set(true); navigator.vibrate?.([500, 250, 500, 250, 500]); this.beep(); this.timer = window.setInterval(() => { this.beep(); navigator.vibrate?.([500, 250, 500]); }, 1500); }
  private beep() { if (!this.audio) return; const oscillator = this.audio.createOscillator(); const gain = this.audio.createGain(); oscillator.type = 'square'; oscillator.frequency.value = 850; gain.gain.setValueAtTime(.18, this.audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, this.audio.currentTime + .7); oscillator.connect(gain).connect(this.audio.destination); oscillator.start(); oscillator.stop(this.audio.currentTime + .7); }
}
