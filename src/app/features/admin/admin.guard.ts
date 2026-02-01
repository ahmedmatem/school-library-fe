import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "../../data-access/auth.store";
import { AuthBootstrapService } from "../../auth/auth-bootstrap";

export const adminGuard: CanActivateFn = async () => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    const bootstrap = inject(AuthBootstrapService);

    await bootstrap.ensureMeLoaded();

    if(auth.isAdmin()) return true;

    return router.createUrlTree(['/catalog'], { queryParams: { denied: 'admin' } });
}