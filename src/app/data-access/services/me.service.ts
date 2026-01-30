import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MSAL_SETTINGS } from '../../auth/msal.settings';
import { Observable } from 'rxjs';

export interface MeDto {
  id: string;
  email: string;
  displayName: string;
  role: 'Teacher' | 'Student' | 'Admin';
  grade: number | null;
  classCode: string | null;
}

export interface CompleteProfileReq {
  grade: number;
  classCode: string;
}

@Injectable({
  providedIn: 'root',
})
export class MeService {
  private http = inject(HttpClient);

  updateProfile(req: CompleteProfileReq) {
    return this.http.patch(`${MSAL_SETTINGS.apiBaseUrl}/me/profile`, req);
  }

  getMe(): Observable<MeDto> {
    return this.http.get<MeDto>(`${MSAL_SETTINGS.apiBaseUrl}/me`);
  }

  teacherOnly(): Observable<MeDto> {
    return this.http.get<MeDto>(`${MSAL_SETTINGS.apiBaseUrl}/me/teacher`);
  }
}
