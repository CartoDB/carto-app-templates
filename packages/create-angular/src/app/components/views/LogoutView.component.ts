import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

/** Logout page, which immediately logs out and redirects to login. */
@Component({
  selector: 'logout-view',
  standalone: true,
  imports: [],
  template: ` <p>Logging out…</p> `,
})
export class LogoutViewComponent {
  constructor(auth: AuthService) {
    auth.logout();
  }
}
