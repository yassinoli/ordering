import { Routes } from '@angular/router';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { CustomerTrackingComponent } from './customer-tracking/customer-tracking.component';

export const routes: Routes = [
  { path: 'restaurant', component: RestaurantComponent },
  { path: 'track/:id', component: CustomerTrackingComponent },
  { path: '', pathMatch: 'full', redirectTo: 'restaurant' },
  { path: '**', redirectTo: 'restaurant' }
];
