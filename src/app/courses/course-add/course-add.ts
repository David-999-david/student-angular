import { Component, inject, signal } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { createC } from '../../models/course/course.model';

@Component({
  selector: 'app-course-add',
  standalone: false,
  templateUrl: './course-add.html',
  styleUrl: './course-add.css',
})
export class CourseAdd {
  private readonly service = inject(CourseService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  saving = signal(false);
  errMsg: string | null = null;

  form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      status: [true],
      student_limit: ['', [Validators.required, Validators.min(5)]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
    },
    { validators: this.dateOrderValidator('start_date', 'end_date', false) }
  );

  private praseLocalDateOrDateTime(input: unknown): Date | null {
    if (!input || typeof input !== 'string') {
      return input instanceof Date ? input : null;
    }
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})?))?$/);
    if (!m) {
      const d = new Date(input);
      return isNaN(+d) ? null : d;
    }

    const [, y, mo, d, hh = '00', mi = '00', ss = '00'] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mi), Number(ss));
  }

  // pickedDateToIso(pickedDate: string) : string | null {
  //   if (!pickedDate) return null;
  //   const [y, m, d] = pickedDate.split('-').map(Number);
  //   return new Date(y, m - 1, d).toISOString();
  // }

  pickedDateToIso(pickedDate: string): string | null {
    const d = this.praseLocalDateOrDateTime(pickedDate);
    return d ? d.toISOString() : null;
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

  dateOrderValidator(start = 'start_date', end = 'end_date', allowSameDay = false): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const s = this.praseLocalDateOrDateTime(group.get(start)?.value);
      const e = this.praseLocalDateOrDateTime(group.get(end)?.value);
      if (!s || !e) return null;
      const ok = allowSameDay ? e >= s : e > s;
      return ok ? null : { dateOrder: true };
    };
  }

  get c() {
    return this.form.controls;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: createC = {
      name: v.name,
      description: v.description,
      status: v.status,
      student_limit: +v.student_limit,
      start_date: this.pickedDateToIso(v.start_date)!,
      end_date: this.pickedDateToIso(v.end_date)!,
    };

    this.saving.set(true);

    this.service.createC(payload).subscribe({
      next: () => {
        this.router.navigate(['/courses'], {
          state: { flash: 'Create Success' },
        });
      },
      error: (err) => {
        const msg =
          typeof err?.error === 'string'
            ? err?.error
            : err?.error?.message ?? err?.message ?? 'Failed to create new course';
        this.errMsg = msg;
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }

  back() {
    this.router.navigate(['/courses']);
  }
}
