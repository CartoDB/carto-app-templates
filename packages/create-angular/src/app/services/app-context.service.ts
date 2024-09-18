import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface AppContextProps {
  title: string;
  subtitle: string;
  logo?: {
    src: string;
    alt: string;
  };
  accessToken: string;
  apiVersion?: string;
  apiBaseUrl?: string;
  googleApiKey?: string;
  googleMapId?: string;
  accountsUrl?: string;
  oauth: {
    enabled: boolean;
    domain: string;
    clientId?: string;
    organizationId?: string;
    namespace: string;
    scopes: string[];
    audience: string;
    authorizeEndPoint?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AppContextService implements AppContextProps {
  readonly title = environment.APP_TITLE;
  readonly subtitle = 'Discover the power of developing with Angular';
  readonly logo = {
    src: 'carto.svg',
    alt: 'CARTO logo',
  };
  accessToken = environment.ACCESS_TOKEN;
  readonly apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
  readonly accountsUrl = 'http://app.carto.com/';
  readonly oauth = {
    enabled: environment.AUTH_ENABLED,
    clientId: environment.AUTH_CLIENT_ID,
    organizationId: environment.AUTH_ORGANIZATION_ID || undefined, // Required for SSO.
    domain: environment.AUTH_DOMAIN,
    namespace: 'http://app.carto.com/',
    scopes: [
      'read:current_user',
      'read:connections',
      'read:maps',
      'read:account',
    ],
    audience: 'carto-cloud-native-api',
    authorizeEndPoint: 'https://carto.com/oauth2/authorize', // Only valid if keeping https://localhost:3000/oauthCallback
  };

  constructor() {}
}
