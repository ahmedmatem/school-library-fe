import { Injectable, computed, signal } from '@angular/core';
import { MeDto } from './services/me.service';

export type UserRole = 'Student' | 'Teacher' | 'Admin';

function extractGrade(classCode: string): number | null {
  const m = classCode.trim().match(/^(\d{1,2})/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  me = signal<MeDto | null>(null);

  idTokenEmail = signal<string | null>(null);

  role = computed<UserRole>(() => this.me()?.role as UserRole ?? 'Student');
  isTeacher = computed(() => this.role() === 'Teacher');
  isStudent = computed(() => this.role() === 'Student');
  isAdmin = computed(() => this.role() === 'Admin');

  classValue = computed(() => this.me()?.classCode ?? null);                  // "8A"
  gradeValue = computed(() => this.me()?.grade ?? null);                      // 8

  profileComplete = computed(() => !!this.me()?.grade && !!this.me()?.classCode);

  setMe(dto: MeDto) { 
    dto.email = this.idTokenEmail() ?? '';
    this.me.set(dto); 
  }
  setIdTokenEmail(email: string | null) { this.idTokenEmail.set(email); }

  clear() {
    this.me.set(null);
    this.idTokenEmail.set(null);
  }
}
