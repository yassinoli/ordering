import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_URL } from './api.config';

export interface Restaurant { id: string; name: string; email: string; }
interface AuthResponse { token: string; restaurant: Restaurant; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly restaurant = signal<Restaurant | null>(this.readRestaurant());
  constructor(private http: HttpClient, private router: Router) {}
  get token() { return localStorage.getItem('orderflow_token'); }
  get isLoggedIn() { return !!this.token; }
  login(email: string, password: string) { return this.http.post<AuthResponse>(`${API_URL}/api/auth/login`, { email, password }); }
  register(name: string, email: string, password: string) { return this.http.post<AuthResponse>(`${API_URL}/api/auth/register`, { name, email, password }); }
  save(response: AuthResponse) { localStorage.setItem('orderflow_token', response.token); localStorage.setItem('orderflow_restaurant', JSON.stringify(response.restaurant)); this.restaurant.set(response.restaurant); }
  logout() { localStorage.removeItem('orderflow_token'); localStorage.removeItem('orderflow_restaurant'); this.restaurant.set(null); this.router.navigateByUrl('/login'); }
  private readRestaurant(): Restaurant | null { try { const value = localStorage.getItem('orderflow_restaurant'); return value ? JSON.parse(value) : null; } catch { return null; } }
}
