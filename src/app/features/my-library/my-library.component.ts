import { Component, computed, inject, signal } from '@angular/core';
import { LibraryStore } from '../../data-access/library.store';
import { ResourceStore } from '../../data-access/resource.store';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../data-access/auth.store';
import { SavedResourcesApiService } from '../../data-access/services/saved-resources-api';
import { Resource } from '../../data-access/models/resource.model';

@Component({
  selector: 'app-my-library',
  imports: [RouterLink],
  templateUrl: './my-library.component.html',
  styleUrl: './my-library.component.css',
})
export class MyLibraryComponent {
  private rs = inject(ResourceStore);
  private lib = inject(LibraryStore);
  private auth = inject(AuthStore);
  private api = inject(SavedResourcesApiService);

  loading = signal(false);
  error = signal<string | null>(null);
  items = signal<Resource[]>([]);

  isLoggedIn = computed(() => !!this.auth.me());

  async ngOnInit() {
    await this.loadSaved();
    await this.lib.refreshSavedFromApi();
  }

  async loadSaved() {
    if (!this.auth.me()) return;

    this.loading.set(true);
    this.error.set(null);
    try {
      const list = await this.api.getMine();
      this.items.set(list);

      // keep store in sync so stars in catalog are correct
      await this.lib.refreshSavedFromApi();
    } catch (e: any) {
      this.error.set(e?.message ?? 'Грешка при зареждане.');
    } finally {
      this.loading.set(false);
    }
  }

  // remove from both server + UI list
  async removeSaved(id: string) {
    await this.lib.toggleSaved(id); // calls API + updates savedIds
    this.items.update(arr => arr.filter(x => x.id !== id));
  }

  isAdmin = this.auth.isAdmin;
  isTeacher = this.auth.isTeacher;
  isStaff = this.auth.isStaff;
  createShared = signal(false);

  newCollectionName = signal('');

  tab = signal<'saved' | 'private' | 'shared'>('saved');

  privateCollections = this.lib.privateCollections;
  sharedCollections = this.lib.sharedCollections;

  constructor() {
    this.rs.ensureLoaded();
  }

  collections = this.lib.collections;

  savedResources = computed(() => {
    const ids = this.lib.savedIds();
    const all = this.rs.allResources();
    return all.filter(r => ids.has(r.id));
  });

  collectionResources = (collectionId: string) => computed(() => {
    const col = this.lib.collections().find(c => c.id === collectionId);
    if (!col) return [];
    const ids = new Set(col.resourceIds);
    const all = this.rs.allResources();
    return all.filter(r => ids.has(r.id));
  });

  async toggleSaved(id: string) { await this.lib.toggleSaved(id); }

  createCollection() {
    const scope = this.isTeacher() && this.createShared() ? 'SHARED' : 'PRIVATE';
    this.lib.createCollection(this.newCollectionName(), scope);
    this.newCollectionName.set('');
    this.createShared.set(false);
  }

  deleteCollection(id: string) { this.lib.deleteCollection(id); }

  removeFromCollection(collectionId: string, resourceId: string) {
    this.lib.removeFromCollection(collectionId, resourceId);
  }
}
