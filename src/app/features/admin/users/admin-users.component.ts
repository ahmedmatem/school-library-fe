import { Component, inject, signal } from '@angular/core';
import { AdminUserDto, AdminUsersService } from '../../../data-access/services/admin-users';
import { UserRole } from '../../../data-access/auth.store';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent {
  private api = inject(AdminUsersService);

  q = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  users = signal<AdminUserDto[]>([]);

  roles: UserRole[] = ['Student', 'Teacher', 'Admin'];

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const list = await firstValueFrom(this.api.getAll(this.q().trim()));
      this.users.set(list ?? []);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Load error');
    } finally {
      this.loading.set(false);
    }
  }

  async setRole(u: AdminUserDto, role: UserRole) {
    try {
      await firstValueFrom(this.api.updateRole(u.id, role));
      this.users.set(this.users().map(x => x.id === u.id ? { ...x, role } : x));
    } catch (e: any) {
      this.error.set(e?.message ?? 'Update error');
    }
  }

  constructor() {
    this.load();
  }
}
