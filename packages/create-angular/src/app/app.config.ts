import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';

import { routes } from './app.routes';
import { AccessTokenService } from './services/AccessToken.service';
import { context } from '../context';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAuth0({
      domain: context.oauth.domain,
      clientId: context.oauth.clientId!,
      cacheLocation: 'localstorage',
      authorizationParams: {
        audience: context.oauth.audience,
        organization: context.oauth.organizationId,
        redirect_uri: window.location.origin,
        scope: context.oauth.scopes.join(' '),
      },
    }),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    { provide: AccessTokenService },
  ],
};
