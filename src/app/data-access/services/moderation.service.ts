import { inject, Injectable } from '@angular/core';
import { Resource } from '../models/resource.model';
import { PendingResource } from '../moderation.store';
import { HttpClient } from '@angular/common/http';
import { MSAL_SETTINGS } from '../../auth/msal.settings';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModerationService {
    private http = inject(HttpClient);
    private base = `${MSAL_SETTINGS.apiBaseUrl}/resources`;

    // no more seeding from mock
    async seedApprovedIfEmpty(_: Resource[]): Promise<boolean> {
        return false;
    }

    async getApproved(): Promise<Resource[]> {
        return await firstValueFrom(this.http.get<Resource[]>(`${this.base}`));
    }

    async getPending(): Promise<PendingResource[]> {
        return await firstValueFrom(this.http.get<PendingResource[]>(`${this.base}/pending`));
    }

    async submitPending(resource: Resource): Promise<void> {
        await firstValueFrom(this.http.post<void>(`${this.base}/pending`, resource));
    }

    async approve(pendingId: string): Promise<void> {
        await firstValueFrom(this.http.post<void>(`${this.base}/pending/${pendingId}/approve`, {}));
    }

    async reject(pendingId: string): Promise<void> {
        await firstValueFrom(this.http.delete<void>(`${this.base}/pending/${pendingId}`));
    }

    async updateApproved(id: string, patch: Partial<Resource>): Promise<void> {
        await firstValueFrom(this.http.patch<void>(`${this.base}/${id}`, patch));
    }

    async deleteApproved(id: string): Promise<void> {
        await firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
    }
}
