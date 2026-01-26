export const MSAL_SETTINGS = {
  tenantSubdomain: 'ahmedmatemgmail',
  tenantId: 'd4c9d6c8-b3a9-4008-8930-6b940d7a5946',
  spaClientId: '92fb72b8-3e70-46ac-9815-a1713ed287cf',

  apiScope: 'api://fa06ed6b-79d4-4c9f-8531-ef2799640ad9/access_as_user',

  apiBaseUrl: 'https://localhost:7193/api',

  redirectUri: 'http://localhost:4200/',
  postLogoutRedirectUri: 'http://localhost:4200/',
};

export const MSAL_AUTHORITY =
  `https://${MSAL_SETTINGS.tenantSubdomain}.ciamlogin.com/${MSAL_SETTINGS.tenantId}/v2.0`;


export const MSAL_KNOWN_AUTHORITIES =
  [`${MSAL_SETTINGS.tenantSubdomain}.ciamlogin.com`];
