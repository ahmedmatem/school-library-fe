import { Injectable, computed, signal } from '@angular/core';

export type CollectionScope = 'PRIVATE' | 'SHARED';

export interface Collection {
  id: string;
  name: string;
  scope: CollectionScope;
  resourceIds: string[];
  createdAt: string;
}

const SAVED_KEY = 'sl_saved_ids_v1';
const COLLECTIONS_KEY = 'sl_collections_v1';

function safeParse<T>(s: string | null, fallback: T): T {
  try { return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}
function uid(prefix = 'c'): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

@Injectable({ providedIn: 'root' })
export class LibraryStore {
  private _savedIds = signal<Set<string>>(new Set<string>(
    safeParse<string[]>(localStorage.getItem(SAVED_KEY), [])
  ));

  private _collections = signal<Collection[]>(
    safeParse<any[]>(localStorage.getItem(COLLECTIONS_KEY), []).map(c => ({
      id: c.id,
      name: c.name,
      scope: c.scope ?? 'PRIVATE',
      resourceIds: Array.isArray(c.resourceIds) ? c.resourceIds : [],
      createdAt: c.createdAt ?? new Date().toISOString(),
    }))
  );

  savedIds = computed(() => this._savedIds());
  collections = computed(() => this._collections());
  privateCollections = computed(() => this._collections().filter(c => c.scope === 'PRIVATE'));
  sharedCollections = computed(() => this._collections().filter(c => c.scope === 'SHARED'));


  isSaved(id: string) {
    return computed(() => this._savedIds().has(id));
  }

  toggleSaved(id: string): void {
    const next = new Set(this._savedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);

    this._savedIds.set(next);
    localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(next)));
  }

  createCollection(name: string, scope: CollectionScope = 'PRIVATE'): void {
    const trimmed = name.trim();
    if (!trimmed) return;

    const next = [
      { id: uid('col'), name: trimmed, scope, resourceIds: [], createdAt: new Date().toISOString() },
      ...this._collections(),
    ];
    this._collections.set(next);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  }

  addToCollection(collectionId: string, resourceId: string): void {
    const next = this._collections().map(c => {
      if (c.id !== collectionId) return c;
      if (c.resourceIds.includes(resourceId)) return c;
      return { ...c, resourceIds: [...c.resourceIds, resourceId] };
    });
    this._collections.set(next);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  }

  removeFromCollection(collectionId: string, resourceId: string): void {
    const next = this._collections().map(c => {
      if (c.id !== collectionId) return c;
      return { ...c, resourceIds: c.resourceIds.filter(x => x !== resourceId) };
    });
    this._collections.set(next);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  }

  deleteCollection(collectionId: string): void {
    const next = this._collections().filter(c => c.id !== collectionId);
    this._collections.set(next);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  }
}
