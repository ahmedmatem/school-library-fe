import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../data-access/auth.store';
import { ResourceType, ResourceFormat, Resource } from '../../../data-access/models/resource.model';
import { ModerationStore } from '../../../data-access/moderation.store';
import { ResourceStore } from '../../../data-access/resource.store';
import { GRADES, ALL_CLASSES } from '../../../data-access/visibility-picker.util';

function rid(): string {
  // modern browsers
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID(); // valid GUID
  }

  // fallback (simple RFC4122-ish v4)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

const LAT_TO_CYR: Record<string, string> = {
  'A': 'А',
  'B': 'Б',
  'V': 'В',
  'G': 'Г',
};

function normalizeVisibilityToken(token: string): string {
  let t = (token ?? '').trim();
  if (!t) return '';

  t = t.replace(/\s+/g, '').toUpperCase();

  if (t === 'ВСИЧКИ' || t === 'ВСИ') return 'ALL';

  // ако е 8A / 9V / 10B и т.н. -> направи буквата кирилица
  t = t.replace(/(\d{1,2})([ABVG])$/, (_, g, l) => `${g}${LAT_TO_CYR[l] ?? l}`);

  return t;
}


type VisibilityMode = 'ALL' | 'GRADE' | 'CLASS' | 'CUSTOM';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './add-resource.component.html',
  styleUrl: './add-resource.component.css'
})
export class AddResourceComponent {
  private auth = inject(AuthStore);
  private moderation = inject(ModerationStore);
  private router = inject(Router);
  private rs = inject(ResourceStore);

  grades = GRADES;
  allClasses = ALL_CLASSES;


  isTeacher = this.auth.isTeacher;
  isStaff = this.auth.isStaff;

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
  classToken = signal('7А');
  customVisibility = signal('ALL');

  availableFormats = computed(() => {
    const list = this.rs.formats();
    return list.length ? list : (['PDF', 'EPUB', 'VIDEO', 'AUDIO', 'DOC', 'PPT', 'OTHER'] as any);
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
    const tokens = raw
      .split(',')
      .map(x => normalizeVisibilityToken(x))
      .filter(Boolean);

    return tokens.length ? tokens : ['ALL'];
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
