export const MSAL_SETTINGS = {
  tenantSubdomain: 'ppmgacadnobreshkov',
  tenantId: '1af51696-3983-4b6e-a112-7a386c808edf',
  spaClientId: 'a7fc82a0-9614-4fd1-a231-31d5e6bd2b12',

  apiScope: 'api://ffeae3a1-b0bb-4089-8634-b338c3fecb8a/access_as_user',

  apiBaseUrl: 'https://localhost:7193/api',

  redirectUri: 'http://localhost:4200/',
  postLogoutRedirectUri: 'http://localhost:4200/',
};

export const MSAL_AUTHORITY =
  `https://${MSAL_SETTINGS.tenantSubdomain}.ciamlogin.com/${MSAL_SETTINGS.tenantId}/v2.0`;


export const MSAL_KNOWN_AUTHORITIES =
  [`${MSAL_SETTINGS.tenantSubdomain}.ciamlogin.com`];
