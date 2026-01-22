import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Filters, Resource } from './models/resource.model';
import { ModerationStore } from './moderation.store';
import { AuthStore } from './auth.store';

const DEFAULT_FILTERS: Filters = {
  query: '',
  subject: '',
  type: '',
  format: '',
  tag: '',
};

function normalizeVisibility(r: Resource): string[] {
  const v = r.visibility;
  if (!v || !Array.isArray(v) || v.length === 0) return ['ALL'];
  return v;
}

@Injectable({ providedIn: 'root' })
export class ResourceStore {
private auth = inject(AuthStore);

  private baseResources = signal<Resource[]>([]);
  private loaded = signal(false);

  private debouncedQuery = signal('');

  filters = signal<Filters>({ ...DEFAULT_FILTERS });

  allResources = computed(() => {
    const base = this.baseResources();
    const approved = this.moderation.approved();
    return [...approved, ...base];
  });

  visibleResources = computed(() => {
    const list = this.allResources();

    if (this.auth.isTeacher()) return list;

    const classCode = this.auth.classValue(); // e.g. "8A"
    const grade = this.auth.gradeValue();     // e.g. 8
    const gradeToken = grade ? String(grade) : '';

    return list.filter(r => {
      const v = normalizeVisibility(r);
      if (v.includes('ALL')) return true;
      if (classCode && v.includes(classCode)) return true;
      if (gradeToken && v.includes(gradeToken)) return true;
      return false;
    });
  });

  allTags = computed(() => {
    const set = new Set<string>();
    for (const r of this.allResources()) for (const t of r.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  subjects = computed(() => {
    const set = new Set<string>();
    for (const r of this.allResources()) set.add(r.subject);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  formats = computed(() => {
    const set = new Set<string>();
    for (const r of this.allResources()) set.add(r.format);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  types = computed(() => {
    const set = new Set<Resource['type']>();
    for (const r of this.allResources()) set.add(r.type);
    const arr = Array.from(set);
    arr.sort((a, b) => (a === 'FILE' ? -1 : a === 'LINK' && b === 'FILE' ? 1 : `${a}`.localeCompare(`${b}`)));
    return arr;
  });

  resources = computed(() => {
    const list = this.allResources();
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

  constructor(private http: HttpClient, private moderation: ModerationStore) {
    effect((onCleanup) => {
      const q = this.filters().query;
      const handle = setTimeout(() => this.debouncedQuery.set(q), 300);
      onCleanup(() => clearTimeout(handle));
    });
  }

  ensureLoaded(): void {
    if (this.loaded()) return;

    this.http.get<Resource[]>('/assets/mock/resources.json').subscribe({
      next: (data) => {
        this.baseResources.set(data ?? []);
        this.loaded.set(true);
      },
      error: () => {
        this.baseResources.set([]);
        this.loaded.set(true);
      }
    });
  }

  setQuery(query: string) { this.filters.update(f => ({ ...f, query })); }
  setSubject(subject: string) { this.filters.update(f => ({ ...f, subject })); }
  setType(type: Filters['type']) { this.filters.update(f => ({ ...f, type })); }
  setFormat(format: Filters['format']) { this.filters.update(f => ({ ...f, format })); }
  setTag(tag: string) { this.filters.update(f => ({ ...f, tag })); }

  clearFilters() { this.filters.set({ ...DEFAULT_FILTERS }); }

  getById(id: string) {
    return computed(() => this.allResources().find(x => x.id === id));
  }
}
