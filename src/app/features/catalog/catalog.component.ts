import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ResourceStore } from '../../data-access/resource.store';
import { LibraryStore } from '../../data-access/library.store';
import { AddToCollectionModalComponent } from '../../shared/add-to-collection-modal.component/add-to-collection-modal.component';
import { AuthStore } from '../../data-access/auth.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { ResourceFilters, ResourceService } from '../../data-access/services/resource.service';
import { Resource } from '../../data-access/models/resource.model';

@Component({
  selector: 'app-catalog',
  imports: [ReactiveFormsModule, RouterLink, AddToCollectionModalComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent {
  auth = inject(AuthStore);
  private route = inject(ActivatedRoute);

  private denied = toSignal(
    this.route.queryParamMap.pipe(map(p => p.get('denied'))),
    { initialValue: null }
  );

  saveError = signal<string | null>(null);
  savingId = signal<string | null>(null);

  deniedTeacher = mapDeniedTeacher(this.denied);
  showDenied = signal(true);

  isTeacher = this.auth.isTeacher;

  api = inject(ResourceService);
  rs = inject(ResourceStore);
  lib = inject(LibraryStore);

  loading = signal(false);
  error = signal<string | null>(null);
  items = signal<Resource[]>([]);
  filters = signal<ResourceFilters>({});
  resources = computed(() => this.items());

  @ViewChild(AddToCollectionModalComponent) addModal?: AddToCollectionModalComponent;

  subjects = this.rs.subjects;
  formats = this.rs.formats;
  types = computed(() =>
    this.rs.types().map(t => ({
      value: t,
      label: t === 'FILE' ? 'Файлове' : 'Линкове'
    }))
  );

  tags = this.rs.allTags;

  collections = computed(() => this.lib.collections());

  constructor() {
    effect(() => {
      // whenever catalog?denied=teacher appears, show the alert again
      if (this.deniedTeacher()) this.showDenied.set(true);
    });
  }

  ngOnInit() {
    this.reload();
  }

  async toggleSave(id: string, ev?: Event) {
    ev?.stopPropagation();
    if (!this.auth.me()) return;

    this.saveError.set(null);
    this.savingId.set(id);

    try {
      await this.lib.toggleSaved(id);
    } catch (e: any) {
      this.saveError.set(e?.message ?? 'Грешка при запазване.');
    } finally {
      this.savingId.set(null);
    }
  }

  // handlers
  onQuery(v: string) {
    this.filters.update(f => ({ ...f, query: v }));
    this.reload();
  }

  onSubject(v: string) {
    this.filters.update(f => ({ ...f, subject: v || undefined }));
    this.reload();
  }

  onType(v: any) {
    this.filters.update(f => ({ ...f, type: v || undefined }));
    this.reload();
  }

  onFormat(v: any) {
    this.filters.update(f => ({ ...f, format: v || undefined }));
    this.reload();
  }

  onTag(v: string) {
    this.filters.update(f => ({ ...f, tag: v || undefined }));
    this.reload();
  }

  clear() {
    this.filters.set({});
    this.reload();
  }

  private inFlight?: Promise<void>;

  reload() {
    this.inFlight ??= this.doReload().finally(() => (this.inFlight = undefined));
  }

  private async doReload() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const list = await firstValueFrom(this.api.getApproved(this.filters()));
      this.items.set(list);
    } catch (e: any) {
      this.items.set([]);
      this.error.set(e?.message ?? 'Грешка при зареждане на каталога.');
    } finally {
      this.loading.set(false);
    }
  }

  // toggleSaved(id: string) { this.lib.toggleSaved(id); }
  isSaved(id: string) { return this.lib.isSaved(id); }

  addToCollection(collectionId: string, resourceId: string) {
    if (!collectionId) return;
    this.lib.addToCollection(collectionId, resourceId);
  }

  openAddToCollection(resourceId: string) {
    this.addModal?.openFor(resourceId);

    // Bootstrap modal (vanilla JS)
    const el = document.getElementById('addToCollectionModal');
    // @ts-ignore
    const modal = new bootstrap.Modal(el);
    modal.show();
  }

  hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f.query || f.tag || f.subject || f.type || f.format);
  });

  dismissDenied() {
    this.showDenied.set(false);
  }
}

function mapDeniedTeacher(denied: () => string | null) {
  return () => denied() === 'teacher';
}
