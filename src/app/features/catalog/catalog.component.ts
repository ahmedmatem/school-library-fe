import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ResourceStore } from '../../data-access/resource.store';
import { LibraryStore } from '../../data-access/library.store';

@Component({
  selector: 'app-catalog',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent {
  private rs = inject(ResourceStore);
  private lib = inject(LibraryStore);

  subjects = ['БЕЛ', 'История', 'Биология'];
  types = [
    { value: 'FILE' as const, label: 'Файлове' },
    { value: 'LINK' as const, label: 'Линкове' },
  ];
  formats = ['PDF', 'EPUB', 'VIDEO', 'AUDIO', 'DOC', 'PPT', 'OTHER'];

  filters = this.rs.filters;
  resources = this.rs.resources;

  collections = computed(() => this.lib.collections());

  constructor() { this.rs.ensureLoaded(); }

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
}
