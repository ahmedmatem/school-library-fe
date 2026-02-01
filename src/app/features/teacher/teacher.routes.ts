import { Routes } from '@angular/router';
import { teacherGuard } from './teacher.guard';
import { adminGuard } from '../admin/admin.guard';

export const TEACHER_ROUTES: Routes = [
    {
        path: '',
        canActivate: [teacherGuard],
        canActivateChild: [teacherGuard],
        loadComponent: () => import('./teacher-shell.component').then(m => m.TeacherShellComponent),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'pending' },
            {
                path: 'add',
                loadComponent: () => import('./add-resource/add-resource.component')
                    .then(m => m.AddResourceComponent),
            },
            {
                path: 'pending',
                loadComponent: () => import('./pending-resources/pending-resources.component')
                    .then(m => m.PendingResourcesComponent),
            },
            {
                path: 'manage',
                loadComponent: () => import('./manage-approved/manage-approved.component')
                    .then(m => m.ManageApprovedComponent),
            },
        ],
    },
];
