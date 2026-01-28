import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { MSAL_SETTINGS } from '../../auth/msal.settings';

export interface MeDto {
  id: string;
  email: string;
  displayName: string;
  role: 'Teacher' | 'Student';
  grade: number | null;
  classCode: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class MeService {
  private http = inject(HttpClient);

  getMe(): Observable<MeDto> {
    return this.http.get<MeDto>(`${MSAL_SETTINGS.apiBaseUrl}/me`);
  }
}
