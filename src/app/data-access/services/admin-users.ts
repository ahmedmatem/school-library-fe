import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MSAL_SETTINGS } from '../../auth/msal.settings';

export type UserRole = 'Student' | 'Teacher' | 'Admin';

export interface AdminUserDto {
  id: string;
  subject: string;
  email: string;
  displayName: string;
  role: UserRole;
  grade?: number | null;
  classCode?: string | null;
  createdAt: string;
  lastSeenAt?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminUsersService {
  private http = inject(HttpClient);
  private baseUrl = `${MSAL_SETTINGS.apiBaseUrl}/admin/users`;

  getAll(q?: string) {
    let params = new HttpParams();
    if (q) { params = params.set('q', q); }
    return this.http.get<AdminUserDto[]>(this.baseUrl, { params });
  }

  updateRole(userId: string, role:UserRole) {
    return this.http.patch<AdminUserDto>(`${this.baseUrl}/${userId}/role`, { role });
  }
}
