import { Injectable, computed, signal } from '@angular/core';
import { MeDto } from './services/me.service';

export type UserRole = 'Student' | 'Teacher' | 'Admin';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  me = signal<MeDto | null>(null);

  idTokenEmail = signal<string | null>(null);

  role = computed<UserRole>(() => {
    const r = this.me()?.role;
    return (r === 'Admin' || r === 'Teacher' || r === 'Student') ? r : 'Student';
  });
  isStudent = computed(() => this.role() === 'Student');
  isTeacher = computed(() => this.role() === 'Teacher');
  isAdmin = computed(() => this.role() === 'Admin');
  isStaff = computed(() => this.isTeacher() || this.isAdmin());

  classValue = computed(() => this.me()?.classCode ?? null);                  // "8A"
  gradeValue = computed(() => this.me()?.grade ?? null);                      // 8

  profileComplete = computed(() => this.me()?.grade != null && !!this.me()?.classCode);

  setMe(dto: MeDto) {
    const tokenEmail = this.idTokenEmail();
    this.me.set({
      ...dto,
      // Use API email if it exists; otherwise fallback to ID token email
      email: (dto.email && dto.email.trim()) ? dto.email : (tokenEmail ?? '')
    });
  }
  setIdTokenEmail(email: string | null) { this.idTokenEmail.set(email); }

  clear() {
    this.me.set(null);
    this.idTokenEmail.set(null);
  }
}
