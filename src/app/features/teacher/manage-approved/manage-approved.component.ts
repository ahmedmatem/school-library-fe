import { Component, computed, inject, signal } from '@angular/core';
import { Resource, ResourceFormat, ResourceType } from '../../../data-access/models/resource.model';
import { AuthStore } from '../../../data-access/auth.store';
import { ModerationStore } from '../../../data-access/moderation.store';
import { RouterLink } from '@angular/router';

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

@Component({
  selector: 'app-manage-approved',
  imports: [RouterLink],
  templateUrl: './manage-approved.component.html',
  styleUrl: './manage-approved.component.css',
})
export class ManageApprovedComponent {
  private auth = inject(AuthStore);
  private moderation = inject(ModerationStore);

  isTeacher = this.auth.isTeacher;

  q = signal('');
  typeFilter = signal<string>('');
  formatFilter = signal<string>('');

  approved = this.moderation.approved;

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

  openEdit(r: Resource) {
    const e: EditState = {
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
    this.edit.set(e);

    const el = document.getElementById('editApprovedModal');
    const bs = (window as any).bootstrap;
    bs?.Modal?.getOrCreateInstance(el).show();
  }

  patch<K extends keyof EditState>(key: K, value: EditState[K]) {
    this.edit.update(e => e ? ({ ...e, [key]: value }) : e);
  }

  save() {
    const e = this.edit();
    if (!e) return;

    const title = e.title.trim();
    const subject = e.subject.trim();
    if (!title || !subject) return;

    const tags = (e.tagsText ?? '')
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);

    const visibility = (e.visibilityText ?? '')
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);

    const patch: Partial<Resource> = {
      title,
      author: e.author.trim() || undefined,
      subject,
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
  }

  delete(id: string) {
    const ok = confirm('Сигурен ли си, че искаш да изтриеш този ресурс?');
    if (!ok) return;
    this.moderation.deleteApproved(id);
  }
}
