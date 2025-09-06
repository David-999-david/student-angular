import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounce,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  of,
  startWith,
  Subject,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { ApiResponse, ApiResponseList, StudentJM } from '../../models/student/student.model';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

type UIState =
  | { kind: 'loading'; total: number; queryTotal: number; page: number; totalPage: number }
  | {
      kind: 'error';
      total: number;
      message: string;
      queryTotal: number;
      page: number;
      totalPage: number;
    }
  | {
      kind: 'ok';
      total: number;
      students: StudentJM[];
      queryTotal: number;
      page: number;
      totalPage: number;
    };

@Component({
  selector: 'app-student',
  standalone: false,
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student implements OnInit {
  private readonly service = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destoryRef = inject(DestroyRef);
  private readonly refresh$ = new Subject<void>();

  q = new FormControl<string>(this.route.snapshot.queryParamMap.get('q') ?? '', {
    nonNullable: true,
  });

  flash = signal<string | null>(null);
  deleteId = signal<number | null>(null);

  ngOnInit(): void {
    this.q.valueChanges
      .pipe(
        map((v) => v.trim()),
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destoryRef)
      )
      .subscribe((val) => {
        const nextQ = val.trim();
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { q: nextQ ? nextQ : null, p: 1 },
          queryParamsHandling: 'merge',
        });
      });

    this.route.queryParamMap
      .pipe(
        map((pm) => pm.get('q') ?? ''),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destoryRef)
      )
      .subscribe((v) => {
        if (this.q.value !== v) this.q.setValue(v, { emitEvent: false });
      });

    const s = history.state as { flash?: string };

    if (typeof s?.flash === 'string' && s.flash.trim()) {
      this.flash.set(s.flash);
    }

    const { flash, ...rest } = s;
    history.replaceState(rest, document.title);

    setTimeout(() => this.flash.set(null), 3000);
  }

  hasQuery = this.route.queryParamMap.pipe(
    map((pm) => pm.has('q')),
    distinctUntilChanged()
  );

  private readonly query$ = this.route.queryParamMap.pipe(
    map((pm) => ({
      q: pm.get('q') ?? '',
      p: parseInt(pm.get('p') ?? '1', 10) || 1 ,
    })),
    distinctUntilChanged()
  );

  private readonly reload$ = merge(
    this.query$,
    this.refresh$.pipe(
      withLatestFrom(this.query$),
      map(([_, q]) => q)
    )
  );

  state = toSignal<UIState>(
    this.reload$.pipe(
      switchMap(({ q, p }) =>
        this.service.fetchAll(q, p).pipe(
          map((res: ApiResponseList<StudentJM>) => {
            const totalPage = Math.max(1,res.meta.totalPages ?? 1);
            if (p > totalPage) {
              this.goToPage(totalPage);
            }
            return {
              kind: 'ok',
              students: res.data,
              page: p,
              queryTotal: res.data.length,
              total: res.meta.count,
              totalPage: totalPage,
            } as UIState;
          }),
          startWith({ kind: 'loading', total: 0, queryTotal: 0, page: 1, totalPage: 1 } as UIState),
          catchError(() =>
            of({
              kind: 'error',
              total: 0,
              queryTotal: 0,
              message: 'Failed to load students',
            } as UIState)
          )
        )
      )
    ),
    { requireSync: true }
  );

  delete(id: number) {
    this.deleteId.set(id);

    this.service.delete(id).subscribe({
      next: () => {
        this.refresh$.next();
        this.flash.set('Delete Success');
        setTimeout(() => this.flash.set(null), 3000);
      },
      error: (err) => {
        const msg = typeof err?.error === 'string' ? err.error : err?.message ?? 'Delete failed';
        this.flash.set(msg);
        setTimeout(() => this.flash.set(null), 3000);
      },
    });
  }

  goToPage(p: number) {
    const qpm = this.route.snapshot.queryParamMap;
    const q = qpm.get('q') ?? null;
    const page = Math.max(1, Math.floor(p));
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: q, p: page },
      queryParamsHandling: 'merge',
    });
  }

  prevPage(cur: number) {
    this.goToPage(cur - 1);
  }

  nextPage(cur: number) {
    this.goToPage(cur + 1);
  }

  range(n: number): number[]{
    const len = Math.max(1, Math.floor(n || 1));
    return Array.from({length: len}, (_,i) => i+1);
  }
}
