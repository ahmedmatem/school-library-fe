import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  provideAppInitializer,
  inject
} from '@angular/core';
import { provideRouter, Router } from '@angular/router';

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
import { MeService } from './data-access/services/me.service';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from './data-access/auth.store';

export function appInitializer(
  msal: MsalService,
  meService: MeService,
  auth: AuthStore,
  router: Router
) {
  // msal Initializer
  return async () => {
    await msal.instance.initialize();

    const result = await msal.instance.handleRedirectPromise().catch(() => null);
    if (result?.account) {
      msal.instance.setActiveAccount(result.account);
    } else {
      const accounts = msal.instance.getAllAccounts();
      if (!msal.instance.getActiveAccount() && accounts.length) {
        msal.instance.setActiveAccount(accounts[0]);
      }
    }

    const account = msal.instance.getActiveAccount() ?? msal.instance.getAllAccounts()[0];
    if (!account) {
      auth.clear();
      return;
    }

    // me Initializer
    try {
      const dto = await firstValueFrom(meService.getMe());
      auth.setMe(dto);

      if (dto.role === 'Student' && (!dto.grade || !dto.classCode)) {
        await router.navigateByUrl('/complete-profile');
      }
    } catch {
      // ignore for now
    }
  };
}

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
    provideAppInitializer(() => appInitializer(
      inject(MsalService),
      inject(MeService),
      inject(AuthStore),
      inject(Router)
    )())
  ]
};
