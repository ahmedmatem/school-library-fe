import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType, AuthenticationResult, InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs/operators';
import { AuthStore } from '../../data-access/auth.store';
import { MeDto, MeService } from '../../data-access/services/me.service';
import { firstValueFrom } from 'rxjs';
import { LibraryStore } from '../../data-access/library.store';
import { ModerationStore } from '../../data-access/moderation.store';
import { ResourceStore } from '../../data-access/resource.store';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  auth = inject(AuthStore);
  moderation = inject(ModerationStore);
  rs = inject(ResourceStore);
  lib = inject(LibraryStore);

  classOptions = [
    '5', '6', '7',
    '8А', '8Б', '8В', '8Г',
    '9А', '9Б', '9В', '9Г',
    '10А', '10Б', '10В', '10Г',
    '11А', '11Б', '11В', '11Г',
    '12А', '12Б', '12В', '12Г',
  ];

  private msal = inject(MsalService);
  private msalBroadcast = inject(MsalBroadcastService);
  private meService = inject(MeService);

  hasAccount = signal(false);
  isLoggedIn = computed(() => this.hasAccount() || !!this.auth.me());
  displayName = signal('');
  email = signal<string>('');

  me = signal<MeDto | null>(null);
  meName = computed(() => this.auth.me()?.displayName === 'unknown' ? this.email() : this.auth.me()?.displayName ?? 'Гост');
  meError = signal<string | null>(null);

  ngOnInit() {
    // Wait until MSAL is done (redirect/interaction finished)
    this.msalBroadcast.inProgress$
      .pipe(filter(status => status === InteractionStatus.None))
      .subscribe(async () => {
        // now accounts should be in cache
        this.refreshAccountState();

        try {
          const dto = await firstValueFrom(this.meService.getMe());
          this.auth.setMe(dto);
          if (this.auth.isStaff()) {
            this.rs.ensureLoaded();
            await this.moderation.refresh();
          }
          await this.lib.refreshSavedFromApi();
        } catch {
          // if API fails, keep cleared
          this.auth.clear();
        }
      });

    this.msalBroadcast.msalSubject$
      .pipe(filter((msg: EventMessage) =>
        msg.eventType === EventType.LOGIN_SUCCESS ||
        // msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
        msg.eventType === EventType.LOGOUT_SUCCESS
      ))
      .subscribe(async (msg) => {
        if (msg.eventType === EventType.LOGOUT_SUCCESS) {
          this.auth.clear();
          this.refreshAccountState();
          return;
        }

        if (msg.eventType === EventType.LOGIN_SUCCESS && msg.payload) {
          const res = msg.payload as AuthenticationResult;
          this.msal.instance.setActiveAccount(res.account);
        }
        // this.refreshAccountState();

        // reload DB user after login
        try {
          const dto = await firstValueFrom(this.meService.getMe());
          this.auth.setMe(dto);
          await this.lib.refreshSavedFromApi();
        } catch {
          this.auth.clear();
        }
      });
  }

  private refreshAccountState() {
    const accounts = this.msal.instance.getAllAccounts();
    const active = this.msal.instance.getActiveAccount() ?? accounts[0] ?? null;

    if (active) this.msal.instance.setActiveAccount(active);

    this.hasAccount.set(!!active);

    this.displayName.set(active?.name ?? active?.username ?? '');

    this.email.set(this.getEmailFromIdToken() ?? '');
    this.auth.setIdTokenEmail(this.email());
  }

  login() { this.msal.loginRedirect(); }
  logout() { this.msal.logoutRedirect(); }

  getEmailFromIdToken(): string | null {
    const account = this.msal.instance.getActiveAccount()
      ?? this.msal.instance.getAllAccounts()[0];

    if (!account) {
      this.auth.clear();
      return null;
    }

    const claims: any = account.idTokenClaims;

    // Common possibilities
    return claims?.email
      ?? claims?.preferred_username
      ?? claims?.upn
      ?? (Array.isArray(claims?.emails) ? claims.emails[0] : null)
      ?? null;
  }
}
