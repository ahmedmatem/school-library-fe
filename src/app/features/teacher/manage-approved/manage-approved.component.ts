import { Component, computed, inject, signal } from '@angular/core';
import { Resource, ResourceFormat, ResourceType } from '../../../data-access/models/resource.model';
import { AuthStore } from '../../../data-access/auth.store';
import { ModerationStore } from '../../../data-access/moderation.store';
import { RouterLink } from '@angular/router';
import { GRADES, ALL_CLASSES } from '../../../data-access/visibility-picker.util';

type EditState = {
  id: string;
  title: string;
  author: string;
  subject: string;
  description: string;
  type: ResourceType;
  format: ResourceFormat;
  language: string;
  tagsText: string;
  fileUrl: string;
  externalUrl: string;
  visibilityText: string; // comma-separated
};

function isValidHttpUrl(value: string): boolean {
  const v = (value ?? '').trim();
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

@Component({
  selector: 'app-manage-approved',
  imports: [RouterLink],
  templateUrl: './manage-approved.component.html',
  styleUrl: './manage-approved.component.css',
})
export class ManageApprovedComponent {
  private auth = inject(AuthStore);
  private moderation = inject(ModerationStore);

  grades = GRADES;
  allClasses = ALL_CLASSES;

  isTeacher = this.auth.isTeacher;

  q = signal('');
  typeFilter = signal<string>('');
  formatFilter = signal<string>('');

  approved = this.moderation.approved;

  // visibility
  visMode = signal<'ALL' | 'GRADE' | 'CLASS'>('ALL');
  visGrade = signal('8');
  visClass = signal('8А');

  toast = signal<string>('');

  formats = computed(() => {
    const set = new Set<string>();
    for (const r of this.approved()) set.add(r.format);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    const tf = this.typeFilter();
    const ff = this.formatFilter();

    return this.approved().filter(r => {
      if (q) {
        const hay = (r.title + ' ' + (r.author ?? '') + ' ' + r.subject).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (tf && r.type !== tf) return false;
      if (ff && r.format !== ff) return false;
      return true;
    });
  });

  edit = signal<EditState | null>(null);
  private editOriginal = signal<EditState | null>(null);

  formError = signal<string>('');

  isValidHttpUrl = isValidHttpUrl;

  openEdit(r: Resource) {
    const state: EditState = {
      id: r.id,
      title: r.title ?? '',
      author: r.author ?? '',
      subject: r.subject ?? '',
      description: r.description ?? '',
      type: r.type,
      format: r.format,
      language: r.language ?? 'bg',
      tagsText: (r.tags ?? []).join(', '),
      fileUrl: r.fileUrl ?? '',
      externalUrl: r.externalUrl ?? '',
      visibilityText: (r.visibility && r.visibility.length ? r.visibility : ['ALL']).join(', '),
    };

    this.edit.set(state);
    this.editOriginal.set({ ...state });
    this.formError.set('');

    const v = (r.visibility && r.visibility.length ? r.visibility : ['ALL'])[0];

    if (v === 'ALL') {
      this.visMode.set('ALL');
    } else if (/^\d{1,2}$/.test(v)) {
      this.visMode.set('GRADE');
      this.visGrade.set(v);
    } else if (/^\d{1,2}[АБВГ]$/.test(v)) {
      this.visMode.set('CLASS');
      this.visClass.set(v);
    } else {
      // fallback: keep as ALL
      this.visMode.set('ALL');
    }

    this.patch('visibilityText', v === 'ALL' ? 'ALL' : v);

    const el = document.getElementById('editApprovedModal');
    const bs = (window as any).bootstrap;
    bs?.Modal?.getOrCreateInstance(el).show();
  }

  patch<K extends keyof EditState>(key: K, value: EditState[K]) {
    this.edit.update(e => e ? ({ ...e, [key]: value }) : e);
    this.formError.set('');
  }

  syncVisibilityText() {
    const mode = this.visMode();

    if (mode === 'ALL') {
      this.patch('visibilityText', 'ALL');
      return;
    }

    if (mode === 'GRADE') {
      this.patch('visibilityText', this.visGrade());
      return;
    }

    this.patch('visibilityText', this.visClass());
  }


  canSave = computed(() => {
    const e = this.edit();
    if (!e) return false;

    const title = e.title.trim();
    const subject = e.subject.trim();
    if (!title || !subject) return false;

    if (e.type === 'FILE') return !!e.fileUrl.trim();
    if (e.type === 'LINK') return isValidHttpUrl(e.externalUrl);
    return false;
  });

  save() {
    const e = this.edit();
    if (!e) return;

    if (!this.canSave()) {
      this.formError.set('Моля попълни задължителните полета.');
      return;
    }

    const tags = (e.tagsText ?? '').split(',').map(x => x.trim()).filter(Boolean);
    const visibility = (e.visibilityText ?? '').split(',').map(x => x.trim()).filter(Boolean);

    const patch: Partial<Resource> = {
      title: e.title.trim(),
      author: e.author.trim() || undefined,
      subject: e.subject.trim(),
      description: e.description.trim() || undefined,
      type: e.type,
      format: e.format,
      language: e.language.trim() || 'bg',
      tags,
      visibility: visibility.length ? visibility : ['ALL'],
      fileUrl: e.type === 'FILE' ? (e.fileUrl.trim() || undefined) : undefined,
      externalUrl: e.type === 'LINK' ? (e.externalUrl.trim() || undefined) : undefined,
    };

    this.moderation.updateApproved(e.id, patch);

    const el = document.getElementById('editApprovedModal');
    const bs = (window as any).bootstrap;
    bs?.Modal?.getOrCreateInstance(el).hide();

    this.edit.set(null);
    this.editOriginal.set(null);
    this.formError.set('');

    this.toast.set('Запазено.');
    setTimeout(() => this.toast.set(''), 1500);
  }

  cancelEdit() {
    const original = this.editOriginal();
    this.edit.set(original ? { ...original } : null);
    this.formError.set('');
  }

  delete(id: string) {
    if (!confirm('Сигурен ли си, че искаш да изтриеш този ресурс?')) return;
    this.moderation.deleteApproved(id);

    this.toast.set('Ресурсът е изтрит.');
    setTimeout(() => this.toast.set(''), 1500);
  }
}
