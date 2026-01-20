import { computed, effect, Injectable, signal } from "@angular/core";
import { Filters, ResourceModel } from "./models/resource.model";
import { HttpClient } from "@angular/common/http";

const DEFAULT_FILTERS: Filters = {
  query: '',
  subject: '',
  type: '',
  format: '',
  tag: '',
};

@Injectable({ providedIn: 'root' })
export class ResourceStore {
  // Raw data
  private allSig = signal<ResourceModel[]>([]);
  private loadedSig = signal(false);

  // Filters (instant)
  filters = signal<Filters>({ ...DEFAULT_FILTERS });

  // Debounced filters (used for filtering / calling backend later)
  debouncedFilters = signal<Filters>({ ...DEFAULT_FILTERS });

  // Derived resources (front filtering for MVP)
  resources = computed(() => {
    const list = this.allSig();
    const f = this.debouncedFilters();
    const q = f.query.trim().toLowerCase();

    return list.filter(r => {
      if (q) {
        const hay = (r.title + ' ' + (r.author ?? '')).toLowerCase();
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
    // ✅ Debounce на филтрите (например 300ms)
    effect((onCleanup) => {
      const f = this.filters();
      const handle = setTimeout(() => this.debouncedFilters.set(f), 300);
      onCleanup(() => clearTimeout(handle));
    });
  }

  ensureLoaded(): void {
    if (this.loadedSig()) return;

    this.http.get<ResourceModel[]>('/assets/mock/resources.json').subscribe({
      next: (data) => {
        this.allSig.set(data ?? []);
        this.loadedSig.set(true);
      },
      error: () => {
        this.allSig.set([]);
        this.loadedSig.set(true);
      }
    });
  }

  // usefull setters
  setQuery(query: string) {
    this.filters.update(f => ({ ...f, query }));
  }
  setSubject(subject: string) {
    this.filters.update(f => ({ ...f, subject }));
  }
  setType(type: Filters['type']) {
    this.filters.update(f => ({ ...f, type }));
  }
  setFormat(format: Filters['format']) {
    this.filters.update(f => ({ ...f, format }));
  }
  setTag(tag: string) {
    this.filters.update(f => ({ ...f, tag }));
  }
  clearFilters() {
    this.filters.set({ ...DEFAULT_FILTERS });
  }

  // for details page
  getById(id: string) {
    return computed(() => this.allSig().find(x => x.id === id));
  }
}