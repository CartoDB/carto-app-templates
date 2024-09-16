/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_CARTO_ACCESS_TOKEN: string;
  readonly VITE_CARTO_AUTH_ENABLED: string;
  readonly VITE_CARTO_AUTH_CLIENT_ID: string;
  readonly VITE_CARTO_AUTH_ORGANIZATION_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
