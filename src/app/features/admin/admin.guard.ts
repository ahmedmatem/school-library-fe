import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "../../data-access/auth.store";

export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthStore);
    const router = inject(Router);

    if((auth as any).isAdmin?.()) return true; // in case already added isAdmin computed
    if((auth as any).role?.() === 'Admin') return true;

    return router.createUrlTree(['/catalog'], { queryParams: { denied: 'admin' } });
}