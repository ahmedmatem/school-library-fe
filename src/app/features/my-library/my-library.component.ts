import { Component, computed, inject, signal } from '@angular/core';
import { LibraryStore } from '../../data-access/library.store';
import { ResourceStore } from '../../data-access/resource.store';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../data-access/auth.store';

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

  isTeacher = this.auth.isTeacher;
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

  toggleSaved(id: string) { this.lib.toggleSaved(id); }

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
