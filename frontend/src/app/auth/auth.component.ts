import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({ selector: 'app-auth', imports: [CommonModule, FormsModule], template: `
  <section class="auth-card"><p class="eyebrow">OrderFlow for restaurants</p><h1>{{ registerMode ? 'Create your restaurant' : 'Welcome back' }}</h1><p>Each restaurant has its own secure dashboard and orders.</p>
  <form (ngSubmit)="submit()"><input *ngIf="registerMode" [(ngModel)]="name" name="name" placeholder="Restaurant name" required><input [(ngModel)]="email" name="email" type="email" placeholder="Email address" required><input [(ngModel)]="password" name="password" type="password" minlength="8" placeholder="Password (8+ characters)" required><button [disabled]="loading()">{{ loading() ? 'Please wait...' : registerMode ? 'Create account' : 'Sign in' }}</button></form>
  <p class="error" *ngIf="error()">{{ error() }}</p><button class="link-button" type="button" (click)="registerMode = !registerMode">{{ registerMode ? 'Already have an account? Sign in' : 'New restaurant? Create an account' }}</button></section>
` })
export class AuthComponent {
  private auth = inject(AuthService); private router = inject(Router); private route = inject(ActivatedRoute); registerMode = this.route.snapshot.routeConfig?.path === 'register'; name = ''; email = ''; password = ''; readonly loading = signal(false); readonly error = signal('');
  submit() { this.loading.set(true); this.error.set(''); const request = this.registerMode ? this.auth.register(this.name, this.email, this.password) : this.auth.login(this.email, this.password); request.subscribe({ next: result => { this.auth.save(result); this.router.navigateByUrl('/dashboard'); }, error: error => { this.error.set(error.error?.message ?? 'Something went wrong. Please try again.'); this.loading.set(false); } }); }
}
