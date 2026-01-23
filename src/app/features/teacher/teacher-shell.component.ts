import { Component, inject } from '@angular/core';
import { AuthStore } from '../../data-access/auth.store';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-teacher',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './teacher-shell.component.html',
  styleUrl: './teacher-shell.component.css',
})
export class TeacherShellComponent {
  private auth = inject(AuthStore);
  isTeacher = this.auth.isTeacher;
}
