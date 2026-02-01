import { inject, Injectable } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthStore } from '../data-access/auth.store';
import { MeService } from '../data-access/services/me.service';
import { filter, firstValueFrom } from 'rxjs';
import { EventMessage, AuthenticationResult, EventType } from '@azure/msal-browser';

@Injectable({
  providedIn: 'root',
})
export class AuthBootstrapService {
  private msal = inject(MsalService);
  private msalBroadcast = inject(MsalBroadcastService);
  private meService = inject(MeService);
  private auth = inject(AuthStore);

  private inFlight?: Promise<void>;

  constructor() {
    // initial attempt (app refresh)
    void this.refreshMe();

    // react to auth events
    this.msalBroadcast.msalSubject$
      .pipe(filter((msg: EventMessage) =>
        msg.eventType === EventType.LOGIN_SUCCESS ||
        msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
        msg.eventType === EventType.LOGOUT_SUCCESS
      ))
      .subscribe((msg) => {
        if (msg.eventType === EventType.LOGOUT_SUCCESS) {
          this.auth.clear();
          return;
        }

        // ensure active account is set after login redirect
        if (msg.eventType === EventType.LOGIN_SUCCESS && msg.payload) {
          const res = msg.payload as AuthenticationResult;
          if (res.account) this.msal.instance.setActiveAccount(res.account);
        }

        void this.refreshMe();
      });
  }

  /** Guards can call this to ensure `auth.me()` is ready */
  ensureMeLoaded(): Promise<void> {
    return this.inFlight ?? this.refreshMe();
  }

  private async refreshMe(): Promise<void> {
    // dedupe concurrent calls
    if (this.inFlight) return this.inFlight;

    this.inFlight = (async () => {
      const account =
        this.msal.instance.getActiveAccount() ??
        this.msal.instance.getAllAccounts()[0] ??
        null;

      if (!account) {
        this.auth.clear();
        return;
      }

      // optional: keep email fallback from id token
      const claims: any = account.idTokenClaims;
      const email =
        claims?.email ??
        claims?.preferred_username ??
        claims?.upn ??
        (Array.isArray(claims?.emails) ? claims.emails[0] : null) ??
        null;

      this.auth.setIdTokenEmail(email);

      try {
        const dto = await firstValueFrom(this.meService.getMe());
        this.auth.setMe(dto);
      } catch {
        // if API call fails (token not attached / API down), keep cleared so UI doesn't assume role
        this.auth.clear();
      }
    })();

    try {
      await this.inFlight;
    } finally {
      this.inFlight = undefined;
    }
  }
}
