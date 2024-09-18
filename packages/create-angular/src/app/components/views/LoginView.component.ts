import { Component } from '@angular/core';
import { context } from '../../../context';
import { AuthService } from '@auth0/auth0-angular';

/** Login page, showing a button that redirects to login form. */
@Component({
  selector: 'login-view',
  standalone: true,
  imports: [],
  template: `
    <main class="login">
      @if (context.logo) {
        <img
          class="login-logo"
          [src]="context.logo.src"
          [alt]="context.logo.alt"
        />
      }
      <h1 class="title">{{ context.title }}</h1>
      <p class="subtitle">{{ context.subtitle }}</p>
      <button class="body1" (click)="auth.loginWithRedirect()">
        Login with CARTO
      </button>
      <p class="caption">Use your CARTO credentials</p>
    </main>
  `,
})
export class LoginViewComponent {
  context = context;
  constructor(public auth: AuthService) {}
}
