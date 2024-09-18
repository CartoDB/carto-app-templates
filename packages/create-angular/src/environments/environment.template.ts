export const environment = {
  APP_TITLE: '$title',
  ACCESS_TOKEN: '$accessToken',

  // @ts-expect-error Replaced in template setup.
  AUTH_ENABLED: '$authEnabled' === 'true',
  AUTH_CLIENT_ID: '$authClientID',
  AUTH_ORGANIZATION_ID: '$authOrganizationID',
  AUTH_DOMAIN: '$authDomain',
};
