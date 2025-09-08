import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { FormBuilder } from '@angular/forms';
import {
  combineLatest,
  distinctUntilChanged,
  from,
  map,
  merge,
  shareReplay,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { Gender, StudentJM, updateS } from '../../models/student/student.model';

@Component({
  selector: 'app-student-detail',
  standalone: false,
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css',
})
export class StudentDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(StudentService);
  private readonly fb = inject(FormBuilder);
  private readonly refresh$ = new Subject<void>();

  editing = signal(false);
  saving = signal(false);

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

  vm$ = combineLatest([this.student$, this.genders$, this.isEdit$]).pipe(
    tap(([s, g, e]) => {
      this.currentStudent = s;
      this.genders = g;
      this.setFormValue(s, g);

      this.editing.set(e);
      if (e) {
        this.form.enable({ emitEvent: false });
      } else {
        this.form.disable({ emitEvent: false });
      }
    }),
    map(([s, g, e]) => ({
      s,
      g,
      e,
    }))
  );

  onClick() {
    const next = !this.editing();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: next ? 1 : null },
      queryParamsHandling: 'merge',
      replaceUrl: !next,
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
        this.flash.set('Update Success')
        setTimeout(() => this.flash.set(null),3000)
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
}
