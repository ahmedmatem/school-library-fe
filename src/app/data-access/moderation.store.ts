import { computed, inject, Injectable, signal } from '@angular/core';
import { Resource } from './models/resource.model';
import { ModerationService } from './services/moderation.service';

export interface PendingResource {
  pendingId: string;
  resource: Resource;
  submittedAt: string;
}

const APPROVED_KEY = 'sl_approved_resources_v1';
const PENDING_KEY = 'sl_pending_resources_v1';

function safeParse<T>(s: string | null, fallback: T): T {
  try { return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}

function uid(prefix = 'p'): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

@Injectable({
  providedIn: 'root',
})
export class ModerationStore {
  private moderationService = inject(ModerationService);

  private _pending = signal<PendingResource[]>(
    safeParse<PendingResource[]>(localStorage.getItem(PENDING_KEY), [])
  );

  private _approved = signal<Resource[]>(
    safeParse<Resource[]>(localStorage.getItem(APPROVED_KEY), [])
  );

  pending = computed(() => this._pending());
  approved = computed(() => this._approved());

  constructor() { this.refresh(); }

  async seedApprovedIfEmpty(seed: Resource[]) {
    const didSeed = await this.moderationService.seedApprovedIfEmpty(seed);
    if (didSeed) await this.refresh();
  }

  async refresh() {
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

  clearAll() {
    this._pending.set([]);
    this._approved.set([]);
    localStorage.removeItem(PENDING_KEY);
    localStorage.removeItem(APPROVED_KEY);
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
