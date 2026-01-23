import { computed, Injectable, signal } from '@angular/core';
import { Resource } from './models/resource.model';

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
  private _pending = signal<PendingResource[]>(
    safeParse<PendingResource[]>(localStorage.getItem(PENDING_KEY), [])
  );

  private _approved = signal<Resource[]>(
    safeParse<Resource[]>(localStorage.getItem(APPROVED_KEY), [])
  );

  pending = computed(() => this._pending());
  approved = computed(() => this._approved());

  submit(resource: Resource) {
    const p: PendingResource = {
      pendingId: uid('pend'),
      resource,
      submittedAt: new Date().toISOString(),
    };

    const next = [p, ...this._pending()];
    this._pending.set(next);
    localStorage.setItem(PENDING_KEY, JSON.stringify(next));
  }

  approve(pendingId: string) {
    const list = this._pending();
    const item = list.find(x => x.pendingId === pendingId);
    if (!item) return;

    // remove from pending
    const pendingNext = list.filter(x => x.pendingId !== pendingId);
    this._pending.set(pendingNext);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pendingNext));

    // add to approved (prepend)
    const approvedNext = [item.resource, ...this._approved()];
    this._approved.set(approvedNext);
    localStorage.setItem(APPROVED_KEY, JSON.stringify(approvedNext));
  }

  reject(pendingId: string) {
    const pendingNext = this._pending().filter(x => x.pendingId !== pendingId);
    this._pending.set(pendingNext);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pendingNext));
  }

  clearAll() {
    this._pending.set([]);
    this._approved.set([]);
    localStorage.removeItem(PENDING_KEY);
    localStorage.removeItem(APPROVED_KEY);
  }

  updateApproved(id: string, patch: Partial<Resource>) {
    const next = this._approved().map(r => r.id === id ? ({ ...r, ...patch }) : r);
    this._approved.set(next);
    localStorage.setItem(APPROVED_KEY, JSON.stringify(next));
  }

  deleteApproved(id: string) {
    const next = this._approved().filter(r => r.id !== id);
    this._approved.set(next);
    localStorage.setItem(APPROVED_KEY, JSON.stringify(next));
  }

  getApprovedById(id: string) {
    return computed(() => this._approved().find(r => r.id === id));
  }
}
