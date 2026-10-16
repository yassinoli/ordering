import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header><a routerLink="/restaurant">🍽️ OrderFlow</a><nav><a routerLink="/restaurant">Restaurant</a></nav></header>
    <main><router-outlet /></main>
  `
})
export class AppComponent {}
