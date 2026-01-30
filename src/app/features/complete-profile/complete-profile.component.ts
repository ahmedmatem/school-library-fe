import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../data-access/auth.store';
import { MeService } from '../../data-access/services/me.service';

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

  form = this.fb.group({
    grade: [8, [Validators.required, Validators.min(5), Validators.max(12)]],
    classCode: ['8А', [Validators.required, Validators.maxLength(8)]],
  });

  async save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.error = null;

    try {
      await firstValueFrom(this.meService.updateProfile({
        grade: this.form.value.grade!,
        classCode: this.form.value.classCode!,
      }));

      // refresh /me so the whole UI updates
      const dto = await firstValueFrom(this.meService.getMe());
      this.auth.setMe(dto);

      await this.router.navigateByUrl('/catalog');
    } catch (e: any) {
      this.error = e?.error ?? e?.message ?? 'Грешка при запис.';
    } finally {
      this.saving = false;
    }
  }
}
