import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../data-access/auth.store';
import { ModerationStore } from '../../../data-access/moderation.store';
import { ResourceStore } from '../../../data-access/resource.store';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pending-resources.component.html',
  styleUrl: './pending-resources.component.css'
})
export class PendingResourcesComponent {
  private auth = inject(AuthStore);
  private moderation = inject(ModerationStore);
  private rs = inject(ResourceStore);

  isTeacher = this.auth.isTeacher;
  isAdmin = this.auth.isAdmin;
  pending = this.moderation.pending;
  busy = signal(false);

  sortedPending = computed(() => {
    return [...this.pending()].sort((a, b) => {
      const da = Date.parse(a.resource.createdAt ?? '') || 0;
      const db = Date.parse(b.resource.createdAt ?? '') || 0;
      return db - da; // newest first
    });
  });

  constructor() {
    this.rs.ensureLoaded();
  }

  approve(pendingId: string) {
    this.moderation.approve(pendingId);
  }

  async approveAll() {
    if (!confirm('Да одобря ли всички чакащи ресурси?')) return;
    this.busy.set(true);
    try {
      for (const p of this.sortedPending()) await this.moderation.approve(p.pendingId);
    } finally {
      this.busy.set(false);
    }
  }

  reject(pendingId: string) {
    this.moderation.reject(pendingId);
  }

  rejectAll() {
    if (!confirm('Да отхвърля ли всички чакащи ресурси?')) return;
    for (const p of this.sortedPending()) {
      this.moderation.reject(p.pendingId);
    }
  }
}
