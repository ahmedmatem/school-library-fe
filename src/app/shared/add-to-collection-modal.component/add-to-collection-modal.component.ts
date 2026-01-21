import { Component, computed, inject, signal } from '@angular/core';
import { LibraryStore } from '../../data-access/library.store';
import { ResourceStore } from '../../data-access/resource.store';

@Component({
  selector: 'app-add-to-collection-modal',
  imports: [],
  templateUrl: './add-to-collection-modal.component.html',
  styleUrl: './add-to-collection-modal.component.css',
})
export class AddToCollectionModalComponent {
  private lib = inject(LibraryStore);
  private rs = inject(ResourceStore);
  
  // От Catalog ще сетваме този id (signal) преди да отворим модала
  resourceId = signal<string>('');

  selectedCollectionId = signal<string>('');
  newCollectionName = signal<string>('');
  message = signal<string>('');

  collections = this.lib.collections;

  resource = computed(() => {
    const id = this.resourceId();
    if (!id) return undefined;
    return this.rs.getById(id)();
  });

  canAdd = computed(() => {
    return !!this.resourceId() && !!this.selectedCollectionId();
  });

  openFor(resourceId: string) {
    this.resourceId.set(resourceId);
    this.selectedCollectionId.set('');
    this.newCollectionName.set('');
    this.message.set('');
  }

  createCollection() {
    const name = this.newCollectionName().trim();
    if (!name) return;

    this.lib.createCollection(name);
    // избери новосъздадената (тя се добавя най-отгоре)
    const first = this.lib.collections()[0];
    if (first) this.selectedCollectionId.set(first.id);

    this.newCollectionName.set('');
    this.message.set('Колекцията е създадена.');
    // махни съобщението след малко
    setTimeout(() => this.message.set(''), 1500);
  }

  add() {
    const colId = this.selectedCollectionId();
    const resId = this.resourceId();
    if (!colId || !resId) return;

    this.lib.addToCollection(colId, resId);
    this.message.set('Ресурсът е добавен към колекцията.');
    setTimeout(() => this.message.set(''), 1500);
  }
}
