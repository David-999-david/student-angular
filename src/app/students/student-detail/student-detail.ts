import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { FormBuilder, FormControl } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  from,
  map,
  merge,
  shareReplay,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { ApiResponseList, Gender, StudentJM, updateS } from '../../models/student/student.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CourseService } from '../../services/course.service';
import { JoinCourseM } from '../../models/course/course.model';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialog } from '../../ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-student-detail',
  standalone: false,
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css',
})
export class StudentDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(StudentService);
  private readonly fb = inject(FormBuilder);
  private readonly refresh$ = new Subject<void>();
  private readonly destory = inject(DestroyRef);
  private readonly cS = inject(CourseService);
  private readonly dialog = inject(Dialog);
  private enter$ = new Subject<void>();

  onEnter() {
    this.enter$.next();
  }

  search = new FormControl<string>(this.route.snapshot.queryParamMap.get('q') ?? '', {
    nonNullable: true,
  });

  ngOnInit(): void {
    const debounceSearch$ = this.search.valueChanges.pipe(
      map((val) => val.trim()),
      debounceTime(3000),
      distinctUntilChanged()
    );

    const enterAction$ = this.enter$.pipe(map(() => this.search.value?.trim() ?? ''));

    merge(debounceSearch$, enterAction$)
      .pipe(takeUntilDestroyed(this.destory))
      .subscribe((val) => {
        const nextS = val.trim();
        this.router.navigate([], {
          queryParams: { q: nextS ? nextS : null, p: 1 },
          queryParamsHandling: 'merge',
        });
      });

    this.route.queryParamMap
      .pipe(
        map((pm) => pm.get('q') ?? ''),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destory)
      )
      .subscribe((v) => {
        if (this.search.value !== v) this.search.setValue(v, { emitEvent: false });
      });
  }

  editing = signal(false);
  saving = signal(false);
  joining = signal(false);

  errorMsg: string | null = null;
  flash = signal<string | null>(null);

  form = this.fb.group({
    name: [''],
    email: [''],
    phone: [''],
    address: [''],
    gender_id: [<number | null>null],
    status: [true],
  });

  private currentStudent!: StudentJM;
  private genders: Gender[] = [];

  allCourses: JoinCourseM[] = [];
  filteredC: JoinCourseM[] = [];

  private setFormValue(s: StudentJM, g: Gender[]) {
    const genderId = g.find((g) => g.gender === s.gender)?.id ?? null;
    this.form.patchValue(
      {
        name: s.name,
        email: s.email,
        phone: s.phone,
        address: s.address,
        gender_id: genderId,
        status: s.status,
      },
      { emitEvent: false }
    );
  }

  get c() {
    return this.form.controls;
  }

  private query$ = this.route.queryParamMap.pipe(
    map((q) => ({
      q: q.get('q') ?? '',
      p: parseInt(q.get('p') ?? '1', 10) || 1,
    }))
  );

  fetchAllCourses = merge(
    this.query$,
    this.refresh$.pipe(
      withLatestFrom(this.query$),
      map(([_, q]) => q)
    )
  ).pipe(
    switchMap(({ q, p }) =>
      this.cS.fetchAllC(q, p).pipe(
        map((res: ApiResponseList<JoinCourseM>) => {
          this.allCourses = res.data;
          const totalPage = res.meta.totalPages;
          if (p > totalPage) {
            this.goToPage(totalPage);
          }
          return { c: res.data, m: res.meta };
        })
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  genders$ = this.service.fetchGender().pipe(
    map((res) => res.data),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private readonly id$ = this.route.paramMap.pipe(
    map((p) => +p.get('id')!),
    distinctUntilChanged()
  );

  student$ = merge(
    this.id$,
    this.refresh$.pipe(
      withLatestFrom(this.id$),
      map(([_, id]) => id)
    )
  ).pipe(
    switchMap((id) => this.service.getSById(id).pipe(map((res) => res.data))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  isEdit$ = this.route.queryParamMap.pipe(
    map((pm) => pm.has('edit')),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  isJoin$ = this.route.queryParamMap.pipe(
    map((v) => v.has('join')),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  vm$ = combineLatest([
    this.student$,
    this.genders$,
    this.isEdit$,
    this.isJoin$,
    this.fetchAllCourses,
    this.query$,
  ]).pipe(
    tap(([s, g, e, j, f]) => {
      this.currentStudent = s;
      this.genders = g;
      this.setFormValue(s, g);

      this.editing.set(e);
      this.joining.set(j);

      const joinCIds = s.courses.map((c) => c.id);
      const notJoinCIds = this.allCourses.filter((c) => !joinCIds.includes(c.id));
      this.filteredC = notJoinCIds.filter((c) => c.status === true);
      if (e) {
        this.form.enable({ emitEvent: false });
      } else {
        this.form.disable({ emitEvent: false });
      }
    }),
    map(([s, g, e, j, f, q]) => ({
      s,
      g,
      e,
      j,
      f,
      q,
    }))
  );

  onClick() {
    const next = !this.editing();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: next ? 1 : null, join: null },
      queryParamsHandling: 'merge',
      replaceUrl: !next,
    });
  }

  onJoin() {
    const next = !this.joining();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { join: next ? 1 : null },
      queryParamsHandling: 'merge',
      replaceUrl: !next,
    });
  }

  cancelJoin() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { join: null, q: null, p: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const id = this.currentStudent.id;
    const v = this.form.getRawValue();
    const payload: updateS = {
      name: v.name?.trim(),
      email: v.email?.trim().toLowerCase(),
      phone: v.phone?.trim(),
      address: v.address?.trim(),
      gender_id: v.gender_id,
      status: v.status,
    };

    this.service.editSById(id, payload).subscribe({
      next: () => {
        this.refresh$.next();
        this.flash.set('Update Success');
        setTimeout(() => this.flash.set(null), 3000);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { edit: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      },
      complete: () => {
        this.saving.set(false);
      },
      error: (err) => {
        const msg =
          typeof err?.error === 'string'
            ? err?.error
            : err?.error?.message ?? err?.message ?? 'Error when update student';
        this.errorMsg = msg;
      },
    });
  }

  cancel() {
    this.setFormValue(this.currentStudent, this.genders);
    this.flash.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  goToPage(n: number) {
    const qpm = this.route.snapshot.queryParamMap;
    const q = qpm.get('q') ?? null;
    const page = Math.max(1, Math.floor(n));
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: q, p: page },
      queryParamsHandling: 'merge',
    });
  }

  prePage(n: number) {
    this.goToPage(n - 1);
  }

  nextPage(n: number) {
    this.goToPage(n + 1);
  }

  range(n: number): number[] {
    const len = Math.max(1, Math.floor(n || 1));
    return Array.from({ length: len }, (_, i) => i + 1);
  }

  joinCList = signal<JoinCourseM[]>([]);
  joinCIds = signal<Set<number>>(new Set());

  isSelected(id: number) {
    return this.joinCIds().has(id);
  }

  removeAll() {
    this.joinCIds.set(new Set());
    this.joinCList.set([]);
  }

  selectJoin(c: JoinCourseM) {
    const cId = c.id;
    const currentSelected = this.joinCIds().has(cId);

    if (!this.currentStudent.status) {
      this.flash.set('Status is Inactive');
      setTimeout(() => this.flash.set(null), 5000);
      return;
    }
    if (c.limit === c.current) {
      this.flash.set('Course is full!');
      setTimeout(() => this.flash.set(null), 5000);
      return;
    }
    if (this.joinCIds().size >= 10) {
      this.flash.set('Only can join 10 courses at once!');
      setTimeout(() => this.flash.set(null), 5000);
      return;
    } else {
      this.joinCIds.update((set) => {
        const next = new Set(set);
        next.has(cId) ? next.delete(cId) : next.add(cId);
        return next;
      });
      this.joinCList.update((list) => {
        if (currentSelected) {
          return list.filter((c) => c.id !== cId);
        } else {
          return list.some((c) => c.id === cId) ? list : [...list, c];
        }
      });
    }
  }

  removeJoin(c: JoinCourseM) {
    this.joinCIds.update((set) => {
      const next = new Set(set);
      if (next.has(c.id)) {
        next.delete(c.id);
      }
      return next;
    });
    this.joinCList.update((list) => list.filter((x) => x.id !== c.id));
  }

  joinStart = signal(false);

  joinC() {
    const cIds = Array.from(this.joinCIds());

    if (cIds.length === 0) {
      return;
    }

    this.joinStart.set(true);

    this.service.joinCourses(this.currentStudent.id, cIds).subscribe({
      next: (res) => {
        const result = res.data;
        const joins = result.joins;
        this.refresh$.next();
        this.flash.set(`${joins.length} Courses have success join!`);
        setTimeout(() => this.flash.set(null), 5000);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { join: null, q: null, p: null },
          queryParamsHandling: 'merge',
        });
      },
      error: (e) => {
        const msg =
          typeof e?.error === 'string'
            ? e?.error
            : e?.error ?? e?.message ?? 'Failed to join students to this course';
        this.errorMsg = msg;
        this.flash.set(`${this.errorMsg}`);
        setTimeout(() => this.flash.set(null), 500000);
      },
      complete: () => {
        this.joinStart.set(false);
        this.removeAll();
        this.joinStart.set(false);
      },
    });
  }

  onDeleteId = signal<number | null>(null);

  cancelJoinFn(cId: number) {
    this.onDeleteId.set(cId);
    this.service.cancelJoinS(this.currentStudent.id, cId).subscribe({
      next: () => {
        this.refresh$.next();
        this.flash.set('Delete Success');
        setTimeout(() => this.flash.set(null), 500);
      },
      error: (err) => {
        const msg = typeof err?.error === 'string' ? err?.error : err?.message ?? 'Delete Failed';
        this.flash.set(msg);
        setTimeout(() => this.flash.set(null), 3000);
      },
    });
  }

  async onCancel(c: number) {
    const ref = this.dialog.open<boolean>(ConfirmDialog, {
      data: { title: 'Cancel Join?', message: 'This action cannot be undone.' },
      backdropClass: 'tw-backdrop',
      panelClass: 'tw-panel',
    });

    const ok = await firstValueFrom(ref.closed);

    if (ok === true) {
      this.cancelJoinFn(c);
    }
  }
}
