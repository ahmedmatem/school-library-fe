import { Injectable, computed, signal } from '@angular/core';

export interface Collection {
  id: string;
  name: string;
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
  private savedIdsSig = signal<Set<string>>(new Set<string>(
    safeParse<string[]>(localStorage.getItem(SAVED_KEY), [])
  ));

  private collectionsSig = signal<Collection[]>(
    safeParse<Collection[]>(localStorage.getItem(COLLECTIONS_KEY), [])
  );

  savedIds = computed(() => this.savedIdsSig());
  collections = computed(() => this.collectionsSig());

  isSaved(id: string) {
    return computed(() => this.savedIdsSig().has(id));
  }

  toggleSaved(id: string): void {
    const next = new Set(this.savedIdsSig());
    if (next.has(id)) next.delete(id);
    else next.add(id);

    this.savedIdsSig.set(next);
    localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(next)));
  }

  createCollection(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;

    const next = [
      { id: uid('col'), name: trimmed, resourceIds: [], createdAt: new Date().toISOString() },
      ...this.collectionsSig(),
    ];
    this.collectionsSig.set(next);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  }

  addToCollection(collectionId: string, resourceId: string): void {
    const next = this.collectionsSig().map(c => {
      if (c.id !== collectionId) return c;
      if (c.resourceIds.includes(resourceId)) return c;
      return { ...c, resourceIds: [...c.resourceIds, resourceId] };
    });
    this.collectionsSig.set(next);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  }

  removeFromCollection(collectionId: string, resourceId: string): void {
    const next = this.collectionsSig().map(c => {
      if (c.id !== collectionId) return c;
      return { ...c, resourceIds: c.resourceIds.filter(x => x !== resourceId) };
    });
    this.collectionsSig.set(next);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  }

  deleteCollection(collectionId: string): void {
    const next = this.collectionsSig().filter(c => c.id !== collectionId);
    this.collectionsSig.set(next);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  }
}
