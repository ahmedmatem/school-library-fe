import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ResourceStore } from '../../data-access/resource.store';
import { LibraryStore } from '../../data-access/library.store';

@Component({
  selector: 'app-resource-details',
  imports: [],
  templateUrl: './resource-details.component.html',
  styleUrl: './resource-details.component.css',
})
export class ResourceDetailsComponent {
  private route = inject(ActivatedRoute);
  private rs = inject(ResourceStore);
  private lib = inject(LibraryStore);
  private sanitizer = inject(DomSanitizer);

  private idSig = toSignal(
    this.route.paramMap.pipe(map(p => p.get('id') ?? '')),
    { initialValue: '' }
  );

  private resourceComputed = computed(() => {
    const id = this.idSig();
    if (!id) return undefined;
    return this.rs.getById(id)();
  });

  resource = this.resourceComputed;

  isSaved = computed(() => {
    const id = this.idSig();
    if (!id) return false;
    return this.lib.isSaved(id)();
  });

  safePdfUrl = computed<SafeResourceUrl | null>(() => {
    const r = this.resource();
    if (!r?.fileUrl) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(r.fileUrl);
  });

  constructor() {
    this.rs.ensureLoaded();
  }

  toggleSaved() {
    const id = this.idSig();
    if (!id) return;
    this.lib.toggleSaved(id);
  }
}
