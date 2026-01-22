import { Component, computed, inject, signal } from '@angular/core';
import { LibraryStore } from '../../data-access/library.store';
import { ResourceStore } from '../../data-access/resource.store';
import { AuthStore } from '../../data-access/auth.store';

@Component({
  selector: 'app-add-to-collection-modal',
  imports: [],
  templateUrl: './add-to-collection-modal.component.html',
  styleUrl: './add-to-collection-modal.component.css',
})
export class AddToCollectionModalComponent {
  private lib = inject(LibraryStore);
  private rs = inject(ResourceStore);
  auth = inject(AuthStore);

  // resource selected from Catalog before opening modal
  resourceId = signal<string>('');

  // NEW: create collection state
  newCollectionName = signal<string>('');
  createShared = signal<boolean>(false);
  message = signal<string>('');

  resource = computed(() => {
    const id = this.resourceId();
    if (!id) return undefined;
    return this.rs.getById(id)();
  });

  // NEW: role-based allowed collections
  allowedCollections = computed(() => {
    const cols = this.lib.collections();
    if (this.auth.isTeacher()) return cols;          // teacher: PRIVATE + SHARED
    return cols.filter(c => c.scope === 'PRIVATE');  // student: only PRIVATE
  });

  constructor() {
    this.rs.ensureLoaded();
  }

  // called by Catalog before opening the modal
  openFor(resourceId: string) {
    this.resourceId.set(resourceId);
    this.newCollectionName.set('');
    this.createShared.set(false);
    this.message.set('');
  }

  // NEW: toggle add/remove in collection
  toggleInCollection(collectionId: string) {
    const rid = this.resourceId();
    if (!rid) return;

    const col = this.lib.collections().find(c => c.id === collectionId);
    if (!col) return;

    if (col.resourceIds.includes(rid)) this.lib.removeFromCollection(collectionId, rid);
    else this.lib.addToCollection(collectionId, rid);
  }

  // NEW: create new collection (PRIVATE by default, SHARED only for teachers if checked)
  createCollection() {
    const name = this.newCollectionName().trim();
    if (!name) return;

    const scope = this.auth.isTeacher() && this.createShared() ? 'SHARED' : 'PRIVATE';
    this.lib.createCollection(name, scope);

    this.newCollectionName.set('');
    this.createShared.set(false);

    this.message.set('Колекцията е създадена.');
    setTimeout(() => this.message.set(''), 1200);
  }
}
