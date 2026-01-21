import { Injectable, computed, signal } from '@angular/core';

export type UserRole = 'STUDENT' | 'TEACHER';
const ROLE_KEY = 'sl_role_v1';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  role = signal<UserRole>(this.loadRole());

  isTeacher = computed(() => this.role() === 'TEACHER');
  isStudent = computed(() => this.role() === 'STUDENT');

  setRole(role: UserRole) {
    this.role.set(role);
    localStorage.setItem(ROLE_KEY, role);
  }

  toggleRole() {
    this.setRole(this.role() === 'TEACHER' ? 'STUDENT' : 'TEACHER');
  }

  private loadRole(): UserRole {
    const raw = localStorage.getItem(ROLE_KEY);
    return raw === 'TEACHER' ? 'TEACHER' : 'STUDENT';
  }
}
