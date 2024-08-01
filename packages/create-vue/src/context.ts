import cartoLogo from '/carto.svg';

export interface AppContext {
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

export const DEFAULT_APP_CONTEXT: AppContext = {
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

export const context: AppContext = { ...DEFAULT_APP_CONTEXT };
