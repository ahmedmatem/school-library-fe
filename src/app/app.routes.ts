import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { MyLibraryComponent } from './features/my-library/my-library.component';
import { ResourceDetailsComponent } from './features/resource-details/resource-details.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'catalog', component: CatalogComponent },
    { path: 'resources/:id', component: ResourceDetailsComponent },
    { path: 'my', component: MyLibraryComponent },
    { 
        path: 'teacher',
        loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES)
    },
    { path: '**', redirectTo: '' }
];
