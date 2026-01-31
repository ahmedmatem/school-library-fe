import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Resource } from '../models/resource.model';
import { MSAL_SETTINGS } from '../../auth/msal.settings';

export interface ResourceFilters {
  query?: string;
  subject?: string;
  type?: 'FILE' | 'LINK';
  format?: string;
  tag?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private http = inject(HttpClient);
  private baseUrl = `${MSAL_SETTINGS.apiBaseUrl}/resources`;

  getApproved(filters?: ResourceFilters): Observable<Resource[]> {
    let params = new HttpParams();
    if(filters?.query) params = params.set('query', filters.query);
    if(filters?.subject) params = params.set('subject', filters.subject);
    if(filters?.type) params = params.set('type', filters.type);
    if(filters?.format) params = params.set('format', filters.format);
    if(filters?.tag) params = params.set('tag', filters.tag);

    return this.http.get<Resource[]>(`${this.baseUrl}/approved`, {params});
  }

  getById(id: string): Observable<Resource | undefined> {
    return this.http.get<Resource>(`${this.baseUrl}/${id}`);
  }

  // teacher actions
  patchApproved(id: string, patch: Partial<Resource>) {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, patch);
  }

  deleteApproved(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
