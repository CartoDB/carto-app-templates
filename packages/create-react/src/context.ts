import { createContext } from 'react';
import cartoLogo from '/carto.svg';

export interface AppContextProps {
  title: string;
  logo?: {
    src: string;
    alt: string;
  };
  credentials: {
    accessToken: string;
    apiVersion?: string;
    apiBaseUrl?: string;
  };
  googleApiKey?: string;
  googleMapId?: string;
  accountsUrl?: string;
}

export const DEFAULT_APP_CONTEXT = {
  title: '$title',
  logo: {
    src: cartoLogo,
    alt: 'CARTO logo',
  },
  credentials: {
    accessToken: import.meta.env.VITE_CARTO_ACCESS_TOKEN,
  },
  accountsUrl: 'http://app.carto.com/',
};

export const AppContext = createContext<AppContextProps>(DEFAULT_APP_CONTEXT);
