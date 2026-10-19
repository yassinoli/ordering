import { Routes } from '@angular/router';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { CustomerTrackingComponent } from './customer-tracking/customer-tracking.component';

export const routes: Routes = [
  { path: 'dashboard', component: RestaurantComponent },
  { path: 'order/:orderId', component: CustomerTrackingComponent },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
