import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { MyLibraryComponent } from './features/my-library/my-library.component';
import { ResourceDetailsComponent } from './features/resource-details/resource-details.component';
import { AddResourceComponent } from './features/add-resource/add-resource.component';
import { PendingResourcesComponent } from './features/pending-resources/pending-resources.component';
import { ManageApprovedComponent } from './features/manage-approved/manage-approved.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'catalog', component: CatalogComponent },
    { path: 'resources/:id', component: ResourceDetailsComponent },
    { path: 'my', component: MyLibraryComponent },
    { path: 'teacher/add', component: AddResourceComponent },
    { path: 'teacher/pending', component: PendingResourcesComponent },
    { path: 'teacher/manage', component: ManageApprovedComponent},
    { path: '**', redirectTo: '' }
];
