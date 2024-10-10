export const environment = {
  APP_TITLE: '$title',
  ACCESS_TOKEN: '$accessToken',
  API_BASE_URL: '$apiBaseURL',

  // @ts-expect-error Replaced in template setup.
  AUTH_ENABLED: '$authEnabled' === 'true',
  AUTH_CLIENT_ID: '$authClientID',
  AUTH_ORGANIZATION_ID: '$authOrganizationID',
  AUTH_DOMAIN: '$authDomain',
};
