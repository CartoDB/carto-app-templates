import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NAV_ROUTES, RoutePath } from '../app.routes';
import { context } from '../../context';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  host: { id: 'root' },
  template: `
    <header class="app-bar">
      @if (context.logo) {
        <img
          class="app-bar-logo"
          [src]="context.logo.src"
          [alt]="context.logo.alt"
        />
      }
      <span class="app-bar-text body1 strong">{{ context.title }}</span>
      <nav v-if="routes.length > 1" class="app-bar-nav">
        @for (route of NAV_ROUTES; track route.path) {
          <a
            [routerLink]="route.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="body2 strong"
            >{{ route.text }}</a
          >
        }
      </nav>
      <span class="flex-space"></span>
      @if (context.oauth.enabled) {
        <a [routerLink]="RoutePath.LOGOUT" class="body2 strong">Sign out</a>
      }
    </header>
    <router-outlet />
  `,
})
export class AppLayoutComponent {
  NAV_ROUTES = NAV_ROUTES;
  RoutePath = RoutePath;
  context = context;
}
