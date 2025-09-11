import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth';
import { catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private service = inject(AuthService);
  access_tk = signal<string | null>(null);
  private timer: any = null;
  private inflight$?: Observable<void>;

  getAccessTk() {
    return this.access_tk();
  }

  setAccessTk(token: string, expireInSec: number) {
    this.access_tk.set(token);
    this.earlyRefresh(expireInSec);
  }

  refreshAll(): Observable<void> {
    if (!this.inflight$) {
      const src$ = this.service.refresh().pipe(
        tap((res) => this.setAccessTk(res.accessToken, res.expireIn)),
        map(() => void 0),
        finalize(() => (this.inflight$ = undefined))
      );
      this.inflight$ = src$.pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
    return this.inflight$;
  }

  clear() {
    this.access_tk.set(null);
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  bootstrap(): Observable<void> {
    if (this.access_tk()) return of(void 0);
    return this.refreshAll().pipe(catchError(() => of(void 0)));
  }

  private earlyRefresh(expireIn: number) {
    if (this.timer) clearTimeout(this.timer);

    const early10percent = Math.min(60, Math.max(15, Math.floor(expireIn * 0.1)));
    const delayMs = Math.max(5000, (expireIn - early10percent) * 1000);
    this.timer = setTimeout(() => this.refreshAll().subscribe(), delayMs);
  }
}
