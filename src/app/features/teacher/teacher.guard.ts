import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../data-access/auth.store';

export const teacherGuard: CanActivateFn = () => {
    const auth = inject(AuthStore);
    const router = inject(Router);

    if (auth.isTeacher()) return true;

    return router.parseUrl('/catalog');
};
