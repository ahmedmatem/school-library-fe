import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";
import { AuthStore } from '../../data-access/auth.store';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  auth = inject(AuthStore);

  classOptions = [
    '5','6', '7',
    '8А','8Б','8В','8Г',
    '9А','9Б','9В','9Г',
    '10А','10Б','10В','10Г',
    '11А','11Б','11В','11Г',
    '12А','12Б','12В','12Г',
  ];
}
