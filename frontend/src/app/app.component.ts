import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({ selector: 'app-root', imports: [RouterOutlet, RouterLink], template: `<header><a routerLink="/dashboard">OrderFlow</a><nav><a routerLink="/dashboard">Staff dashboard</a></nav></header><main><router-outlet /></main>` })
export class AppComponent {}
