import { Injectable, computed, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Filters, ResourceModel } from './models/resource.model';

const DEFAULT_FILTERS: Filters = {
  query: '',
  subject: '',
  type: '',
  format: '',
  tag: '',
};

@Injectable({ providedIn: 'root' })
export class ResourceStore {
  private _allResources = signal<ResourceModel[]>([]);
  private loading = signal(false);

  // UI filters (instant)
  filters = signal<Filters>({ ...DEFAULT_FILTERS });

  // Debounced ONLY query (best UX)
  private debouncedQuery = signal('');

  // Public: all resources (unfiltered)
  allResources = computed(() => this._allResources());

  // Public: unique tags (for dropdown)
  allTags = computed(() => {
    const set = new Set<string>();
    for (const r of this._allResources())
      for (const t of r.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  // Catalog resources (filtered)
  resources = computed(() => {
    const list = this._allResources();
    const f = this.filters();
    const q = this.debouncedQuery().trim().toLowerCase();

    return list.filter(r => {
      if (q) {
        const hay = (r.title + ' ' + (r.author ?? '') + ' ' + (r.description ?? '')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (f.subject && r.subject !== f.subject) return false;
      if (f.type && r.type !== f.type) return false;
      if (f.format && r.format !== f.format) return false;
      if (f.tag && !r.tags.includes(f.tag)) return false;
      return true;
    });
  });

  constructor(private http: HttpClient) {
    // Debounce ONLY query
    effect((onCleanup) => {
      const q = this.filters().query;
      const handle = setTimeout(() => this.debouncedQuery.set(q), 300);
      onCleanup(() => clearTimeout(handle));
    });
  }

  ensureLoaded(): void {
    if (this.loading()) return;

    this.http.get<ResourceModel[]>('/assets/mock/resources.json').subscribe({
      next: (data) => {
        this._allResources.set(data ?? []);
        this.loading.set(true);
      },
      error: () => {
        this._allResources.set([]);
        this.loading.set(true);
      }
    });
  }

  // usefull setters
  setQuery(query: string) { this.filters.update(f => ({ ...f, query })); }
  setSubject(subject: string) { this.filters.update(f => ({ ...f, subject })); }
  setType(type: Filters['type']) { this.filters.update(f => ({ ...f, type })); }
  setFormat(format: Filters['format']) { this.filters.update(f => ({ ...f, format })); }
  setTag(tag: string) { this.filters.update(f => ({ ...f, tag })); }

  clearFilters() { this.filters.set({ ...DEFAULT_FILTERS }); }

  getById(id: string) {
    return computed(() => this._allResources().find(x => x.id === id));
  }
}
