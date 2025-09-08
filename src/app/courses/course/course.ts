import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ApiResponseList } from '../../models/student/student.model';
import { JoinCourseM } from '../../models/course/course.model';

type UIState =
  | { kind: 'loading'; total: number; queryTotal: number; page: number; totalPage: number }
  | {
      kind: 'ok';
      total: number;
      queryTotal: number;
      page: number;
      totalPage: number;
      courses: JoinCourseM[];
    }
  | {
      kind: 'error';
      total: number;
      queryTotal: number;
      message: string;
      totalPage: number;
      page: number;
    };

@Component({
  selector: 'app-course',
  standalone: false,
  templateUrl: './course.html',
  styleUrl: './course.css',
})
export class Course implements OnInit {
  private readonly service = inject(CourseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destoryRef = inject(DestroyRef);

  qc = new FormControl<string>(this.route.snapshot.queryParamMap.get('q') ?? '', {
    nonNullable: true,
  });

  flash = signal<string | null>(null);

  ngOnInit(): void {
    this.qc.valueChanges
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
        if (this.qc.value !== v) this.qc.setValue(v, { emitEvent: false });
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
    map((v) => v.has('q')),
    distinctUntilChanged()
  );

  private refresh$ = new Subject<void>();

  private readonly query$ = this.route.queryParamMap.pipe(
    map((pm) => ({
      q: pm.get('q') ?? '',
      p: parseInt(pm.get('p') ?? '1', 10) || 1,
    })),
    distinctUntilChanged()
  );

  private vms$ = merge(
    this.query$,
    this.refresh$.pipe(
      withLatestFrom(this.query$),
      map(([_, q]) => q)
    )
  ).pipe(
    switchMap(({ q, p }) =>
      this.service.fetchAllC(q, p).pipe(
        map((res: ApiResponseList<JoinCourseM>) => {
          const totalPage = Math.max(1, res.meta.totalPages);
          if (p > totalPage) {
            this.goToPage(totalPage);
          }
          return {
            kind: 'ok',
            courses: res.data,
            total: res.meta.count,
            page: p,
            totalPage: totalPage,
            queryTotal: res.data.length,
          } as UIState;
        }),
        catchError(() =>
          of({
            kind: 'error',
            total: 0,
            queryTotal: 0,
            totalPage: 1,
            page: 1,
            message: 'Failed to load courses',
          } as UIState)
        )
      )
    ),
    startWith({
      kind: 'loading',
      page: 1,
      total: 0,
      queryTotal: 0,
      totalPage: 1,
    } as UIState)
  );

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

  state = toSignal(this.vms$, {
    initialValue: {
      kind: 'loading',
      page: 1,
      total: 0,
      queryTotal: 0,
      totalPage: 1,
    } as UIState,
  });

  range(n: number): number[] {
    const len = Math.max(1, Math.floor(n || 1));
    return Array.from({ length: len }, (_, i) => i + 1);
  }

  onDeleteId = signal<number | null>(null);

  delete(id: number) {
    this.onDeleteId.set(id);

    this.service.deleteC(id).subscribe({
      next: () => {
        this.refresh$.next();
        this.flash.set('Delete Success');
        setTimeout(() => this.flash.set(null), 3000);
      },
      error: (err) => {
        const msg = typeof err?.error === 'string' ? err?.error : err?.message ?? 'Delete Failed';
        this.flash.set(msg);
        setTimeout(() => this.flash.set(null), 3000);
      },
    });
  }
}
