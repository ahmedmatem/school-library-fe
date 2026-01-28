import {
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation,
  IPublicClientApplication,
} from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';
import {
  MSAL_AUTHORITY,
  MSAL_KNOWN_AUTHORITIES,
  MSAL_SETTINGS,
} from './msal.settings';

export function msalInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: MSAL_SETTINGS.spaClientId,
      authority: MSAL_AUTHORITY,
      knownAuthorities: MSAL_KNOWN_AUTHORITIES,
      redirectUri: MSAL_SETTINGS.redirectUri,
      postLogoutRedirectUri: MSAL_SETTINGS.postLogoutRedirectUri,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
  });
}

export function msalGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [MSAL_SETTINGS.apiScope],
    },
  };
}

export function msalInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const map = new Map<string, string[]>();

  // Protect all API calls
  map.set(MSAL_SETTINGS.apiBaseUrl, [MSAL_SETTINGS.apiScope]);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: map,
  };  // Result: any Angular HttpClient call to https://localhost:7001/api/... 
      // will include Authorization: Bearer <token>.
}
