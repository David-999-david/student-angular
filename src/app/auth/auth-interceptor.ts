import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TokenService } from '../services/token';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

const AuthPath = ['/auth/register', '/auth/login', '/auth/refresh', 
  'auth/logout', 'auth/verify'];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  service = inject(TokenService);

  private isAuthPath(url: string) {
    return AuthPath.some((p) => url.includes(p));
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const access = this.service.getAccessTk();

    const isAuth = this.isAuthPath(req.url);

    const authReq =
      access && !isAuth ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } }) : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status !== 401 || isAuth) {
          return throwError(() => err);
        }

        return this.service.refreshAll().pipe(
          switchMap(() => {
            const newAccess = this.service.getAccessTk();
            const retry = newAccess
              ? req.clone({
                  setHeaders: { Authorization: `Bearer ${newAccess}` },
                })
              : req;
            return next.handle(retry);
          }),
          catchError((e) => {
            this.service.clear();
            return throwError(() => e);
          })
        );
      })
    );
  }
}

export const AuthInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
}
