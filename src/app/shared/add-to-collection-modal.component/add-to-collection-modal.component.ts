import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../data-access/auth.store';
import { ResourceType, ResourceFormat, Resource } from '../../data-access/models/resource.model';
import { ModerationStore } from '../../data-access/moderation.store';
import { ResourceStore } from '../../data-access/resource.store';

function rid(): string {
  return `r_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

type VisibilityMode = 'ALL' | 'GRADE' | 'CLASS' | 'CUSTOM';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './add-to-collection-modal.component.html',
  styleUrl: "./add-to-collection-modal.component.css"
})
export class AddResourceComponent {
  private auth = inject(AuthStore);
  private moderation = inject(ModerationStore);
  private router = inject(Router);
  private rs = inject(ResourceStore);

  isTeacher = this.auth.isTeacher;

  title = signal('');
  author = signal('');
  subject = signal('');
  description = signal('');
  type = signal<ResourceType>('FILE');
  format = signal<ResourceFormat>('PDF');
  language = signal('bg');
  tagsText = signal('');
  fileUrl = signal('');
  externalUrl = signal('');
  message = signal('');

  visibilityMode = signal<VisibilityMode>('ALL');
  gradeToken = signal('7');
  classToken = signal('7A');
  customVisibility = signal('ALL');

  availableFormats = computed(() => {
    const list = this.rs.formats();
    return list.length ? list : (['PDF','EPUB','VIDEO','AUDIO','DOC','PPT','OTHER'] as any);
  });

  constructor() {
    this.rs.ensureLoaded();
  }

  isValidUrl = computed(() => {
    const v = this.externalUrl().trim();
    if (!v) return false;
    try {
      const u = new URL(v);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  });

  visibilityTokens = computed(() => {
    const mode = this.visibilityMode();
    if (mode === 'ALL') return ['ALL'];

    if (mode === 'GRADE') {
      const g = this.gradeToken().trim();
      return g ? [g] : ['ALL'];
    }

    if (mode === 'CLASS') {
      const c = this.classToken().trim();
      return c ? [c] : ['ALL'];
    }

    const raw = this.customVisibility().trim();
    if (!raw) return ['ALL'];
    return raw.split(',').map(x => x.trim()).filter(Boolean);
  });

  canSubmit = computed(() => {
    const t = this.title().trim();
    const s = this.subject().trim();
    const f = this.format();
    const ty = this.type();
    if (!t || !s || !f || !ty) return false;

    if (ty === 'LINK') return this.isValidUrl();
    if (ty === 'FILE') return !!this.fileUrl().trim();
    return false;
  });

  submit() {
    if (!this.canSubmit()) return;

    const tags = this.tagsText()
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);

    const resource: Resource = {
      id: rid(),
      title: this.title().trim(),
      author: this.author().trim() || undefined,
      description: this.description().trim() || undefined,
      type: this.type(),
      format: this.format(),
      subject: this.subject().trim(),
      language: this.language().trim() || 'bg',
      tags,
      createdAt: new Date().toISOString(),
      fileUrl: this.type() === 'FILE' ? this.fileUrl().trim() : undefined,
      externalUrl: this.type() === 'LINK' ? this.externalUrl().trim() : undefined,
      visibility: this.visibilityTokens(),
    };

    this.moderation.submit(resource);
    this.message.set('Ресурсът е добавен в чакащи.');
    setTimeout(() => this.router.navigateByUrl('/teacher/pending'), 400);
  }

  resetForm() {
    this.title.set('');
    this.author.set('');
    this.subject.set('');
    this.description.set('');
    this.type.set('FILE');
    this.format.set('PDF');
    this.language.set('bg');
    this.tagsText.set('');
    this.fileUrl.set('');
    this.externalUrl.set('');
    this.message.set('');

    this.visibilityMode.set('ALL');
    this.gradeToken.set('7');
    this.classToken.set('7A');
    this.customVisibility.set('ALL');
  }
}
