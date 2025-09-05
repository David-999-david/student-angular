import { Component, inject } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { map } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { createS } from '../../models/student/student.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-add',
  standalone: false,
  templateUrl: './student-add.html',
  styleUrl: './student-add.css',
})
export class StudentAdd {
  private readonly service = inject(StudentService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  saving: boolean = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;

  gender$ = this.service.fetchGender().pipe(map((res) => res.data));

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    address: ['', [Validators.required, Validators.minLength(3)]],
    gender_id: ['', [Validators.required]],
    status: [true, [Validators.required]],
  });

  get c() {
    return this.form.controls;
  }

  submit() {
    this.errorMsg = null;
    this.successMsg = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: createS = {
      name: v.name.trim(),
      email: v.email.trim().toLowerCase(),
      address: v.address.trim(),
      phone: v.phone.trim(),
      gender_id: +v.gender_id,
      status: !!v.status,
    };

    this.saving = true;

    this.service.create(payload).subscribe({
      next: () => {
        // this.successMsg = 'Student created Successfully';
        // this.form.reset({
        //   name: '',
        //   email: '',
        //   phone: '',
        //   address: '',
        //   gender_id: '',
        //   status: true,
        // });
        this.router.navigate(['/students'], {state : {flash: 'Student created'}});
      },
      error: (err) => {
        const msg =
          typeof err?.error === 'string'
            ? err?.error
            : err?.error?.message ?? err?.message ?? 'Failed to create student';
        this.errorMsg = msg;
      },
      complete: () => {
        this.saving = false;
      },
    });
  }
}
