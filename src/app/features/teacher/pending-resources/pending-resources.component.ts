import { Component, inject } from '@angular/core';
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
  pending = this.moderation.pending;

  constructor() {
    this.rs.ensureLoaded();
  }

  approve(pendingId: string) {
    this.moderation.approve(pendingId);
  }

  reject(pendingId: string) {
    this.moderation.reject(pendingId);
  }
}
