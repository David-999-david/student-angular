// import { inject, Injectable } from '@angular/core';
// import {
//   ActivatedRouteSnapshot,
//   CanActivate,
//   GuardResult,
//   MaybeAsync,
//   Router,
//   RouterStateSnapshot,
// } from '@angular/router';
// import { TokenService } from '../services/token';
// import { catchError, map, of, timeout } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class AuthGuard implements CanActivate {
//   private service = inject(TokenService);
//   private router = inject(Router);

//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
//     if (this.service.getAccessTk()) return of(true);

//     return this.service.bootstrap().pipe(
//       timeout(2000),
//       map(() => {
//         const ok = !!this.service.getAccessTk();
//         return ok
//           ? true
//           : this.router.createUrlTree(['/auth/login'], {
//               queryParams: { returnUrl: state.url },
//             });
//       }),
//       catchError(() =>
//         of(this.router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } }))
//       )
//     );
//   }
// }

import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
} from '@angular/router';
import { TokenService } from '../services/token';
import { catchError, map, of, timeout } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private service = inject(TokenService);
  private router = inject(Router);

  private decide(redirectUrl: string) {
    console.log('AuthGuard check. token =', this.service.getAccessTk());
    if (this.service.getAccessTk()) return of(true);

    return this.service.bootstrap().pipe(
      timeout(2000),
      map(() => {
        const ok = !!this.service.getAccessTk();
        return ok
          ? true
          : this.router.createUrlTree(['/auth/login'], {
              queryParams: { returnUrl: redirectUrl },
            });
      }),
      catchError(() =>
        of(this.router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: redirectUrl } }))
      )
    );
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return this.decide(state.url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): MaybeAsync<GuardResult> {
    return this.decide(state.url);
  }

  canMatch(route: Route, segments: UrlSegment[]): MaybeAsync<GuardResult> {
    const url = '/' + segments.map((s) => s.path).join('/');
    return this.decide(url || '/');
  }
}
