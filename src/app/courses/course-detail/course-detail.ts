import { Component, inject, signal } from '@angular/core';
import { CourseService } from '../../services/course.service';
import {
  combineLatest,
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
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { JoinCourseM, updateC } from '../../models/course/course.model';

@Component({
  selector: 'app-course-detail',
  standalone: false,
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.css',
})
export class CourseDetail {
  private readonly service = inject(CourseService);
  private readonly refresh$ = new Subject<void>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

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

  editing = signal(false);

  onClick() {
    const next = !this.editing();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: next ? 1 : 0 },
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

  vm$ = combineLatest([this.course$, this.isEdit$]).pipe(
    tap(([c, e]) => {
      this.currentC = c;
      this.setFormValue(c);

      this.editing.set(e);

      if (e) {
        this.form.enable({ emitEvent: false });
      } else {
        this.form.disable({ emitEvent: false });
      }
    }),
    map(([c, e]) => ({
      c,
      e,
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

  toDateTimeLocal(val : string | Date | undefined | null) : string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2,'0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`

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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
