import { Injectable } from '@angular/core';
import { Resource } from '../models/resource.model';

export type PendingItem = {
  pendingId: string;
  resource: Resource;
  createdAt: string;
};

const APPROVED_KEY = 'sl_approved_resources_v1';
const PENDING_KEY = 'sl_pending_resources_v1';

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

@Injectable({ providedIn: 'root' })
export class ModerationService {
  async getApproved(): Promise<Resource[]> {
    return safeParse<Resource[]>(localStorage.getItem(APPROVED_KEY), []);
  }

  async getPending(): Promise<PendingItem[]> {
    return safeParse<PendingItem[]>(localStorage.getItem(PENDING_KEY), []);
  }

  async submitPending(resource: Resource): Promise<void> {
    const pending = await this.getPending();
    const item: PendingItem = {
      pendingId: `p_${Math.random().toString(16).slice(2)}_${Date.now()}`,
      resource,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(PENDING_KEY, JSON.stringify([item, ...pending]));
  }

  async approve(pendingId: string): Promise<void> {
    const pending = await this.getPending();
    const approved = await this.getApproved();

    const item = pending.find(x => x.pendingId === pendingId);
    if (!item) return;

    localStorage.setItem(PENDING_KEY, JSON.stringify(pending.filter(x => x.pendingId !== pendingId)));
    localStorage.setItem(APPROVED_KEY, JSON.stringify([item.resource, ...approved]));
  }

  async reject(pendingId: string): Promise<void> {
    const pending = await this.getPending();
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending.filter(x => x.pendingId !== pendingId)));
  }

  async updateApproved(id: string, patch: Partial<Resource>): Promise<void> {
    const approved = await this.getApproved();
    const next = approved.map(r => (r.id === id ? { ...r, ...patch } : r));
    localStorage.setItem(APPROVED_KEY, JSON.stringify(next));
  }

  async deleteApproved(id: string): Promise<void> {
    const approved = await this.getApproved();
    localStorage.setItem(APPROVED_KEY, JSON.stringify(approved.filter(r => r.id !== id)));
  }
}
