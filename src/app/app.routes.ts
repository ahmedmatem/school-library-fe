import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { MyLibraryComponent } from './features/my-library/my-library.component';
import { ResourceDetailsComponent } from './features/resource-details/resource-details.component';
import { AdminUsersComponent } from './features/admin/users/admin-users.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'catalog', component: CatalogComponent },
    { path: 'resources/:id', component: ResourceDetailsComponent },
    { path: 'my', component: MyLibraryComponent },
    { path: 'admin/users', component: AdminUsersComponent },
    {
        path: 'teacher',
        loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES)
    },
    {
        path: 'complete-profile',
        loadComponent: () => import('./features/complete-profile/complete-profile.component')
            .then(m => m.CompleteProfileComponent)
    },
    { path: '**', redirectTo: '' }
];
