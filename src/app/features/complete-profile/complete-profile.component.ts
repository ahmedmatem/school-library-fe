import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../data-access/auth.store';
import { MeService } from '../../data-access/services/me.service';
import { toSignal } from '@angular/core/rxjs-interop';

// Cyrillic letters only (Bulgarian), with separators, at least 2 words
const FULL_NAME_BG_REGEX = /^[А-Яа-я]+(?:-[А-Яа-я]+)* [А-Яа-я]+(?:-[А-Яа-я]+)* [А-Яа-я]+(?:-[А-Яа-я]+)*$/;

@Component({
  selector: 'app-complete-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './complete-profile.component.html',
  styleUrl: './complete-profile.component.css',
})
export class CompleteProfileComponent {
  private fb = inject(FormBuilder);
  private meService = inject(MeService);
  private auth = inject(AuthStore);
  private router = inject(Router);

  saving = false;
  error: string | null = null;

  // Options
  grades = [5, 6, 7, 8, 9, 10, 11, 12];
  classLetters = ['А', 'Б', 'В', 'Г']; // add/remove as needed

  emailFromIdToken = computed(() => this.auth.idTokenEmail() ?? '');
  isStudent = computed(() => this.auth.me()?.role === 'Student');
  isTeacher = computed(() => this.auth.me()?.role === 'Teacher');
  isAdmin = computed(() => this.auth.me()?.role === 'Admin');

  form = this.fb.group({
    fullName: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(200),
      Validators.pattern(FULL_NAME_BG_REGEX),
    ]],
    grade: [null as number | null],
    classLetter: [null as string | null],
  });

  gradeSig = toSignal(this.form.controls.grade.valueChanges, { initialValue: this.form.controls.grade.value });
  letterSig = toSignal(this.form.controls.classLetter.valueChanges, { initialValue: this.form.controls.classLetter.value });

  computedClassCode = computed(() => {
    const g = this.gradeSig();
    const l = this.letterSig();
    return (g && l) ? `${g}${l}` : '';
  });

  constructor() {
    // Apply conditional validators once the role is known
    effect(() => {
      if (this.isStudent()) {
        this.form.controls.grade.setValidators([Validators.required]);
        this.form.controls.classLetter.setValidators([Validators.required]);
        this.form.controls.grade.enable({ emitEvent: false });
        this.form.controls.classLetter.enable({ emitEvent: false });
      } else {
        // Teacher: grade/class are optional and disabled
        this.form.controls.grade.clearValidators();
        this.form.controls.classLetter.clearValidators();

        this.form.controls.grade.setValue(null, { emitEvent: false });
        this.form.controls.classLetter.setValue(null, { emitEvent: false });

        this.form.controls.grade.disable({ emitEvent: false });
        this.form.controls.classLetter.disable({ emitEvent: false });
      }

      this.form.controls.grade.updateValueAndValidity({ emitEvent: false });
      this.form.controls.classLetter.updateValueAndValidity({ emitEvent: false });
    });

    // Optional UX: when grade changes, reset class letter
    this.form.controls.grade.valueChanges.subscribe(() => {
      if (this.isStudent()) {
        this.form.controls.classLetter.setValue(null);
      }
    });
  }

  isInvalid(controlName: 'fullName' | 'grade' | 'classLetter') {
    const c = this.form.controls[controlName];
    return c.invalid && (c.touched || c.dirty);
  }

  async save() {
    if (this.form.invalid) return;

    this.saving = true;
    this.error = null;

    try {
      const fullName = (this.form.value.fullName ?? '').trim();
      const grade = this.isStudent() ? this.form.value.grade : null;
      const classCode = this.isStudent() ? this.computedClassCode() : null;

      await firstValueFrom(this.meService.updateProfile({
        fullName,
        grade,
        classCode
      }));

      // refresh /me so navbar/UI updates
      const dto = await firstValueFrom(this.meService.getMe());
      this.auth.setMe(dto);

      await this.router.navigateByUrl('/catalog'); // pick your home route
    } catch (e: any) {
      this.error = e?.error ?? e?.message ?? 'Грешка при запис.';
    } finally {
      this.saving = false;
    }
  }
}
