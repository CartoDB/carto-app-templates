import { environment } from './environments/environment';

export interface AppContext {
  title: string;
  subtitle: string;
  logo?: {
    src: string;
    alt: string;
  };
  // accessToken moved to AccessTokenService
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

export const context: AppContext = {
  title: environment.APP_TITLE,
  subtitle: 'Discover the power of developing with Angular',
  logo: {
    src: 'carto.svg',
    alt: 'CARTO logo',
  },
  // accessToken moved to AccessTokenService
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
  accountsUrl: 'http://app.carto.com/',
  oauth: {
    enabled: environment.AUTH_ENABLED,
    domain: environment.AUTH_DOMAIN,
    clientId: environment.AUTH_CLIENT_ID,
    organizationId: environment.AUTH_ORGANIZATION_ID || undefined, // Required for SSO.
    namespace: 'http://app.carto.com/',
    scopes: [
      'read:current_user',
      'read:connections',
      'read:maps',
      'read:account',
    ],
    audience: 'carto-cloud-native-api',
    authorizeEndPoint: 'https://carto.com/oauth2/authorize', // Only valid if keeping https://localhost:3000/oauthCallback
  },
};
