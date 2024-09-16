import { Injectable } from '@angular/core';

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

console.log('title', import.meta.env.VITE_APP_TITLE);

@Injectable({
  providedIn: 'root',
})
export class AppContextService implements AppContextProps {
  readonly title = import.meta.env.VITE_APP_TITLE;
  readonly subtitle = 'Discover the power of developing with Angular';
  readonly logo = {
    src: 'carto.svg',
    alt: 'CARTO logo',
  };
  accessToken = import.meta.env.VITE_CARTO_ACCESS_TOKEN;
  readonly apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
  readonly accountsUrl = 'http://app.carto.com/';
  readonly oauth = {
    enabled: import.meta.env.VITE_CARTO_AUTH_ENABLED === 'true',
    domain: 'auth.carto.com',
    clientId: import.meta.env.VITE_CARTO_AUTH_CLIENT_ID,
    organizationId: import.meta.env.VITE_CARTO_AUTH_ORGANIZATION_ID, // Required for SSO.
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
