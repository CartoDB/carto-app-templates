import { reactive } from 'vue';
import cartoLogo from '/carto.svg';

export interface AppContext {
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

export const DEFAULT_APP_CONTEXT: AppContext = {
  title: import.meta.env.VITE_APP_TITLE,
  subtitle: 'Discover the power of developing with Vue',
  logo: {
    src: cartoLogo,
    alt: 'CARTO logo',
  },
  accessToken: import.meta.env.VITE_ACCESS_TOKEN,
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
  accountsUrl: 'http://app.carto.com/',
  oauth: {
    enabled: import.meta.env.VITE_AUTH_ENABLED === 'true',
    domain: import.meta.env.VITE_AUTH_DOMAIN,
    clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
    organizationId: import.meta.env.VITE_AUTH_ORGANIZATION_ID, // Required for SSO.
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

export const context = reactive<AppContext>({ ...DEFAULT_APP_CONTEXT });
