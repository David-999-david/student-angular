import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { StudentService } from '../services/student.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounce,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { ApiResponse, StudentM } from '../models/student/student.model';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

type UIState =
  | { kind: 'loading', total: number }
  | { kind: 'error'; total: number, message: string }
  | { kind: 'ok'; total: number; students: StudentM[] };

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

  q = new FormControl<string>(this.route.snapshot.queryParamMap.get('q') ?? '', {
    nonNullable: true,
  });

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
          queryParams: { q: nextQ ? nextQ : null },
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
  }

  state = toSignal<UIState>(
    this.route.queryParamMap.pipe(
      map((pm) => pm.get('q') ?? ''),
      distinctUntilChanged(),
      switchMap((q) =>
        this.service.fetchAll(q).pipe(
          map(
            (res: ApiResponse<StudentM>) =>
              ({
                kind: 'ok',
                total: res.count,
                students: res.data,
              } as UIState)
          ),
          startWith({ kind: 'loading', total: 0 } as UIState),
          catchError(() =>
            of({
              kind: 'error',
              total: 0,
              message: 'Failed to load students',
            } as UIState)
          )
        )
      )
    ),
    { requireSync: true }
  );
}
