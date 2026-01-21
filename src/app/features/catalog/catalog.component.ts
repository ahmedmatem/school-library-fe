import { Component, computed, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ResourceStore } from '../../data-access/resource.store';
import { LibraryStore } from '../../data-access/library.store';
import { AddToCollectionModalComponent } from '../../shared/add-to-collection-modal.component/add-to-collection-modal.component';

@Component({
  selector: 'app-catalog',
  imports: [ReactiveFormsModule, RouterLink, AddToCollectionModalComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent {
  rs = inject(ResourceStore);
  lib = inject(LibraryStore);

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
  filters = this.rs.filters;
  resources = this.rs.resources;

  collections = computed(() => this.lib.collections());

  constructor() {
    this.rs.ensureLoaded();
  }

  // handlers
  onQuery(v: string) { this.rs.setQuery(v); }
  onSubject(v: string) { this.rs.setSubject(v); }
  onType(v: any) { this.rs.setType(v); }
  onFormat(v: any) { this.rs.setFormat(v); }

  clear() { this.rs.clearFilters(); }

  toggleSaved(id: string) { this.lib.toggleSaved(id); }
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

  onTag(v: string) { this.rs.setTag(v); }

  hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f.query || f.tag || f.subject || f.type || f.format);
  });
}
