import { Routes } from '@angular/router';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { CustomerTrackingComponent } from './customer-tracking/customer-tracking.component';
import { AuthComponent } from './auth/auth.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'dashboard', component: RestaurantComponent, canActivate: [authGuard] },
  { path: 'order/:orderId', component: CustomerTrackingComponent },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
