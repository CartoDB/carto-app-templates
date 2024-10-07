import { Injectable, Signal, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '@auth0/auth0-angular';
import { context } from '../../context';
import { toSignal } from '@angular/core/rxjs-interop';

/**
 * Service providing CARTO access tokens to views.
 */
@Injectable({ providedIn: 'root' })
export class AccessTokenService {
  accessToken: Signal<string>;

  constructor(auth: AuthService) {
    // TODO: In the Vue and React templates, there's more complex hook that seems
    // to be designed to redirect users who haven't completed the signup process.
    // Unclear how that should be adapted to Angular.
    this.accessToken = context.oauth.enabled
      ? (toSignal(auth.getAccessTokenSilently()) as Signal<string>)
      : signal(environment.ACCESS_TOKEN);
  }
}
