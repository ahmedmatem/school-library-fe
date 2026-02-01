import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MSAL_SETTINGS } from '../../auth/msal.settings';
import { Resource } from '../models/resource.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SavedResourcesApiService {
  private http = inject(HttpClient);
  baseUrl = `${MSAL_SETTINGS.apiBaseUrl}/me/saved`;

  async getMine(): Promise<Resource[]> {
    return await firstValueFrom(this.http.get<Resource[]>(this.baseUrl));
  }

  async save(resourceId: string): Promise<void> {
    await firstValueFrom(this.http.put<void>(`${this.baseUrl}/${resourceId}`, {}));
  }
  
  async unsave(resourceId: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${resourceId}`));
  }
}
