import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { map, take } from 'rxjs';
import { RemoteConfigService } from '../firebase/remote-config.service';

export const categoriesFlagGuard: CanMatchFn = (): ReturnType<CanMatchFn> => {
    const rc = inject(RemoteConfigService);
    const router = inject(Router);

    return rc.flags$.pipe(
        take(1),
        map((flags): boolean | UrlTree => {
            if (flags.ff_categories) return true;
            return router.parseUrl('/tabs/tab1');
        })
    );
};
