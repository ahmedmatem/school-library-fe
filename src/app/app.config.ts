import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import {
  MsalModule,
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalInterceptor,
  MsalService,
  MsalGuard,
  MsalBroadcastService
} from '@azure/msal-angular';
import {
  msalInstanceFactory,
  msalGuardConfigFactory,
  msalInterceptorConfigFactory
} from './auth/msal.factories';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(MsalModule),
    { provide: MSAL_INSTANCE, useFactory: msalInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: msalGuardConfigFactory },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: msalInterceptorConfigFactory },
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ]
};
