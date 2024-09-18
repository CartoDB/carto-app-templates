import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppContextService } from '../services/app-context.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet],
  host: { id: 'root' },
  template: `
    <header class="app-bar">
      <img
        v-if="context.logo"
        class="app-bar-logo"
        [src]="contextService.logo.src"
        [alt]="contextService.logo.alt"
      />
      <span class="app-bar-text body1 strong">{{ contextService.title }}</span>
      <nav v-if="routes.length > 1" class="app-bar-nav">
        <!-- <RouterLink
      v-for="route in NAV_ROUTES"
      :to="route.path"
      :key="route.path"
      class="body2 strong"
      :activeClass="'active'"
      >{{ route.text }}</RouterLink
    > -->
      </nav>
      <span className="flex-space"></span>
      <!-- <RouterLink
    v-if="context.oauth.enabled"
    :to="RoutePath.LOGOUT"
    class="body2 strong"
    >Sign out</RouterLink
  > -->
    </header>
    <router-outlet />
  `,
})
export class AppLayoutComponent {
  constructor(public contextService: AppContextService) {}
}
