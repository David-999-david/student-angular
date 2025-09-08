import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CourseService } from '../../services/course.service';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  shareReplay,
  single,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { JoinCourseM, updateC } from '../../models/course/course.model';
import { StudentService } from '../../services/student.service';
import { ApiResponse, ApiResponseList, StudentJM } from '../../models/student/student.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-course-detail',
  standalone: false,
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.css',
})
export class CourseDetail implements OnInit {
  private readonly service = inject(CourseService);
  private readonly refresh$ = new Subject<void>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly sServ = inject(StudentService);
  private readonly destory = inject(DestroyRef);

  ngOnInit(): void {
    this.search.valueChanges
      .pipe(
        map((v) => v.trim()),
        debounceTime(5000),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destory)
      )
      .subscribe((val) => {
        const nextQ = val;
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
        takeUntilDestroyed(this.destory)
      )
      .subscribe((v) => {
        if (this.search.value !== v) this.search.setValue(v, { emitEvent: false });
      });
  }

  private readonly id$ = this.route.paramMap.pipe(
    map((p) => +p.get('id')!),
    distinctUntilChanged()
  );

  course$ = merge(
    this.id$,
    this.refresh$.pipe(
      withLatestFrom(this.id$),
      map(([_, id]) => id)
    )
  ).pipe(
    switchMap((id) => this.service.getIdC(id).pipe(map((res) => res.data))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  isEdit$ = this.route.queryParamMap.pipe(
    map((pm) => pm.has('edit')),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  search = new FormControl<string>(this.route.snapshot.queryParamMap.get('q') ?? '', {
    nonNullable: true,
  });

  private query$ = this.route.queryParamMap.pipe(
    map((q) => ({
      q: q.get('q') ?? '',
      p: parseInt(q.get('p') ?? '1', 10) || 1,
    })),
    distinctUntilChanged()
  );

  allStudents: StudentJM[] = [];

  filteredStudents: StudentJM[] = [];

  fetchAllStudents$ = merge(
    this.query$,
    this.refresh$.pipe(
      withLatestFrom(this.query$),
      map(([_, q]) => q)
    )
  ).pipe(
    switchMap(({ q, p }) =>
      this.sServ.fetchAll(q, p).pipe(
        map((res: ApiResponseList<StudentJM>) => {
          this.allStudents = res.data;
          const totalPage = Math.max(1, res.meta.totalPages);
          if (p > totalPage) {
            this.goToPage(totalPage);
          }
          return { s: res.data, m: res.meta };
        })
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  editing = signal(false);

  onClick() {
    const next = !this.editing();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: next ? 1 : 0, join: null, q: null, p: null },
      queryParamsHandling: 'merge',
      replaceUrl: !next,
    });
  }

  form = this.fb.nonNullable.group(
    {
      name: [''],
      description: [''],
      status: [true],
      limit: ['', [Validators.min(5), Validators.required]],
      start_date: [''],
      end_date: [''],
    },
    { validators: this.dateOrderValidator('start_date', 'end_date', false) }
  );

  private currentC!: JoinCourseM;

  join = signal(false);

  makeJoin() {
    const next = !this.join();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { join: next ? 1 : null },
      queryParamsHandling: 'merge',
      replaceUrl: !next,
    });
  }

  isJoin$ = this.route.queryParamMap.pipe(
    map((val) => val.has('join')),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  vm$ = combineLatest([
    this.course$,
    this.isEdit$,
    this.isJoin$,
    this.fetchAllStudents$,
    this.query$,
  ]).pipe(
    tap(([c, e, j, f, q]) => {
      this.currentC = c;
      this.setFormValue(c);

      const courseOfSIds = c.students.map((s) => s.id);
      const notJoinS = this.allStudents.filter((s) => !courseOfSIds.includes(s.id));
      this.filteredStudents = notJoinS.filter((s) => s.status === true);
      this.editing.set(e);

      this.join.set(j);

      if (e) {
        this.form.enable({ emitEvent: false });
      } else {
        this.form.disable({ emitEvent: false });
      }
    }),
    map(([c, e, j, f, q]) => ({
      c,
      e,
      j,
      f,
      q,
    }))
  );

  get c() {
    return this.form.controls;
  }

  setFormValue(c: JoinCourseM) {
    this.form.patchValue({
      name: c.name,
      description: c.description,
      status: c.status,
      start_date: this.toDateTimeLocal(c.start_date),
      end_date: this.toDateTimeLocal(c.end_date),
      limit: c.limit.toString(),
    });
  }

  // private formDate(d: Date | string): string {
  //   const date = new Date(d);
  //   return date.toISOString().split('T')[0];
  // }

  toDateTimeLocal(val: string | Date | undefined | null): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
  }

  // toDate(v: unknown): Date | null {
  //   if (!v) return null;
  //   if (v instanceof Date) return v;
  //   if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
  //     const [y, m, d] = v.split('-').map(Number);
  //     return new Date(y, m - 1, d);
  //   }
  //   const d = new Date(v as any);
  //   return isNaN(+d) ? null : d;
  // }

  praseDateTimeLocal(input: unknown): Date | null {
    if (!input || typeof input !== 'string') {
      return input instanceof Date ? input : null;
    }
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!m) {
      const d = new Date(input);
      return isNaN(+d) ? null : d;
    }

    const [, y, mo, d, hh = '00', mi = '00', ss = '00'] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mi), Number(ss));
  }

  dateOrderValidator(start = 'start_date', end = 'end_date', allowSameDay = false): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const s = this.praseDateTimeLocal(group.get(start)?.value);
      const e = this.praseDateTimeLocal(group.get(end)?.value);
      if (!s || !e) return null;
      const ok = allowSameDay ? e >= s : e > s;
      return ok ? null : { dateOrder: true };
    };
  }

  // pickedDateToIso(pickedDate: string) {
  //   if (!pickedDate) return null;
  //   const [y, m, d] = pickedDate.split('-').map(Number);
  //   return new Date(y, m - 1, d, 0, 0, 0).toISOString();
  // }

  pickedDateToIso(pickedDate: string): string | null {
    const d = this.praseDateTimeLocal(pickedDate);
    return d ? d.toISOString() : null;
  }

  saving = signal(false);
  errorMsg: string | null = null;
  flash = signal<string | null>(null);

  save() {
    this.errorMsg = null;
    if (this.form.invalid) {
      return this.form.markAllAsTouched();
    }

    const id = this.currentC.id;
    const v = this.form.getRawValue();
    const payload: updateC = {
      name: v.name,
      description: v.description,
      status: v.status,
      student_limit: +v.limit,
      start_date: this.pickedDateToIso(v.start_date)!,
      end_date: this.pickedDateToIso(v.end_date)!,
    };

    this.saving.set(true);

    this.service.updateC(id, payload).subscribe({
      next: () => {
        this.refresh$.next();
        this.flash.set('Update Success');
        setTimeout(() => this.flash.set(null), 3000);
        this.removeAll();
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
    this.setFormValue(this.currentC);
    this.flash.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  cancelJoin() {
    this.setFormValue(this.currentC);
    this.joinSIds.set(new Set());
    this.joinSList.set([]);
    this.flash.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { join: null, q: null, p: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  goToPage(p: number) {
    const qu = this.route.snapshot.queryParamMap;
    const q = qu.get('q') ?? null;
    const page = Math.max(1, Math.floor(p));
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { join: 1, q: q, p: page },
    });
  }

  prevPage(p: number) {
    this.goToPage(p - 1);
  }

  nextPage(p: number) {
    this.goToPage(p + 1);
  }

  range(n: number): number[] {
    const len = Math.max(1, Math.floor(n || 1));
    return Array.from({ length: len }, (_, i) => i + 1);
  }

  joinSList = signal<StudentJM[]>([]);
  joinSIds = signal<Set<number>>(new Set());

  joining = signal(false);
  errMsg: string | null = null;

  onJoin(s: StudentJM) {
    const jid = Number(s.id);
    const currentSelected = this.joinSIds().has(jid);

    const selectedCount = this.joinSIds().size;
    const willBe =
      this.currentC.current + (currentSelected ? selectedCount - 1 : selectedCount + 1);

    if (!this.currentC.status) {
      this.flash.set('Status is Inactive');
      setTimeout(() => this.flash.set(null), 5000);
    } else {
      if (!currentSelected && willBe > this.currentC.limit) {
        this.flash.set('Limit reach!');
        setTimeout(() => this.flash.set(null), 5000);
        return;
      }
      this.joinSIds.update((set) => {
        const next = new Set(set);
        next.has(jid) ? next.delete(jid) : next.add(jid);
        return next;
      });
      this.joinSList.update((list) => {
        if (currentSelected) {
          return list.filter((x) => x.id !== jid);
        } else {
          return list.some((x) => x.id === jid) ? list : [...list, s];
        }
      });
    }
  }

  isSelected(id: number) {
    return this.joinSIds().has(id);
  }

  removeAll() {
    this.joinSIds.set(new Set());
    this.joinSList.set([]);
  }

  joinS() {
    const ids = Array.from(this.joinSIds());

    if (ids.length === 0) return;

    this.joining.set(true);
    this.service.joinS(this.currentC.id, ids).subscribe({
      next: (res) => {
        const result = res.data;
        const joins = result.joins;
        this.refresh$.next();
        this.flash.set(`${joins.length} Students have success join!`);
        setTimeout(() => this.flash.set(null), 5000);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { join: null, p: null, q: null },
          queryParamsHandling: 'merge',
        });
      },
      error: (e) => {
        const msg =
          typeof e?.error === 'string'
            ? e?.error
            : e?.error ?? e?.message ?? 'Failed to join students to this course';
        this.errMsg = msg;
      },
      complete: () => {
        this.joining.set(false);
        this.removeAll();
      },
    });
  }

  deleteId = signal<number | null>(null);

  cancelJoinFn(sId: number) {
    this.deleteId.set(sId);
    this.service.cancelJoinC(this.currentC.id, sId).subscribe({
      next: () => {
        this.refresh$.next();
        this.flash.set('Delete Success');
        setTimeout(() => this.flash.set(null), 5000);
      },
      error: (err) => {
        const msg = typeof err?.error === 'string' ? err?.error : err?.message ?? 'Delete Failed';
        this.flash.set(msg);
        setTimeout(() => this.flash.set(null), 3000);
      },
    });
  }
}
