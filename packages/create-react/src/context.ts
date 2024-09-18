import { createContext } from 'react';
import cartoLogo from '/carto.svg';

export interface AppContextProps {
  title: string;
  subtitle: string;
  logo?: {
    src: string;
    alt: string;
  };
  accessToken: string;
  setAccessToken: (token: string) => void;
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

export const DEFAULT_APP_CONTEXT = {
  title: import.meta.env.VITE_APP_TITLE,
  subtitle: 'Discover the power of developing with React',
  logo: {
    src: cartoLogo,
    alt: 'CARTO logo',
  },
  accessToken: import.meta.env.VITE_ACCESS_TOKEN,
  setAccessToken: () => {},
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
  accountsUrl: 'http://app.carto.com/',
  oauth: {
    enabled: import.meta.env.VITE_AUTH_ENABLED === 'true',
    clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
    organizationId: import.meta.env.VITE_AUTH_ORGANIZATION_ID || undefined, // Required for SSO.
    domain: import.meta.env.VITE_AUTH_DOMAIN,
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

export const AppContext = createContext<AppContextProps>(DEFAULT_APP_CONTEXT);
