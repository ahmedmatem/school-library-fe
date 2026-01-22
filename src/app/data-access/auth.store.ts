import { Injectable, computed, signal } from '@angular/core';

export type UserRole = 'STUDENT' | 'TEACHER';

const ROLE_KEY = 'sl_role_v1';
const CLASS_KEY = 'sl_class_v1';

function extractGrade(classCode: string): number | null {
  const m = classCode.trim().match(/^(\d{1,2})/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private classCode = signal<string>(this.loadClassCode()); // e.g. "8A"

  role = signal<UserRole>(this.loadRole());
  isTeacher = computed(() => this.role() === 'TEACHER');
  isStudent = computed(() => this.role() === 'STUDENT');

  classValue = computed(() => this.classCode());                  // "8A"
  gradeValue = computed(() => extractGrade(this.classCode()));    // 8

  setRole(role: UserRole) {
    this.role.set(role);
    localStorage.setItem(ROLE_KEY, role);
  }

  toggleRole() {
    this.setRole(this.role() === 'TEACHER' ? 'STUDENT' : 'TEACHER');
  }

  setClassCode(code: string) {
    this.classCode.set(code);
    localStorage.setItem(CLASS_KEY, code);
  }

  private loadRole(): UserRole {
    const raw = localStorage.getItem(ROLE_KEY);
    return raw === 'TEACHER' ? 'TEACHER' : 'STUDENT';
  }

  private loadClassCode(): string {
    return localStorage.getItem(CLASS_KEY) ?? '8A';
  }
}
