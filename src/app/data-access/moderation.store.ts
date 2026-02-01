import { computed, inject, Injectable, signal } from '@angular/core';
import { Resource } from './models/resource.model';
import { ModerationService } from './services/moderation.service';
import { AuthStore } from './auth.store';

export interface PendingResource {
  pendingId: string;
  resource: Resource;
  submittedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModerationStore {
  private auth = inject(AuthStore);
  private moderationService = inject(ModerationService);

  // start empty; fill from API when staff is logged in
  private _pending = signal<PendingResource[]>([]);
  private _approved = signal<Resource[]>([]);

  pending = computed(() => this._pending());
  approved = computed(() => this._approved());

  async refresh() {
    // prevent early calls
    if (!this.auth.me()) return;
    if (!(this.auth.isTeacher() || this.auth.isAdmin())) return;

    const p = await this.moderationService.getPending();
    const a = await this.moderationService.getApproved();
    this._pending.set(p);
    this._approved.set(a);
  }

  async submit(resource: Resource) {
    await this.moderationService.submitPending(resource);
    await this.refresh();
  }

  async approve(pendingId: string) {
    await this.moderationService.approve(pendingId);
    await this.refresh();
  }

  async reject(pendingId: string) {
    await this.moderationService.reject(pendingId);
    await this.refresh();
  }

  async updateApproved(id: string, patch: Partial<Resource>) {
    await this.moderationService.updateApproved(id, patch);
    await this.refresh();
  }

  async deleteApproved(id: string) {
    await this.moderationService.deleteApproved(id);
    await this.refresh();
  }

  getApprovedById(id: string) {
    return computed(() => this._approved().find(r => r.id === id));
  }
}
