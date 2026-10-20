import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({ selector: 'app-root', imports: [RouterOutlet, RouterLink, CommonModule], template: `<header><a routerLink="/dashboard">OrderFlow</a><nav *ngIf="auth.restaurant() as restaurant"><span>{{ restaurant.name }}</span><a routerLink="/dashboard">Dashboard</a><button class="header-button" (click)="auth.logout()">Sign out</button></nav><nav *ngIf="!auth.restaurant()"><a routerLink="/login">Sign in</a></nav></header><main><router-outlet /></main>` })
export class AppComponent { readonly auth = inject(AuthService); }
