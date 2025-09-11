import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth';
import { TokenService } from '../services/token';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthApiResponse, RegisterUser } from '../models/auth/auth.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private service = inject(AuthService);
  private ts = inject(TokenService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get c() {
    return this.form.controls;
  }

  saving = signal(false);
  errMsg = signal<string | null>(null);

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: RegisterUser = {
      name: v.name.trim(),
      email: v.email.trim().toLowerCase(),
      password: v.password,
    };

    this.saving.set(true);

    this.service.register(payload).subscribe({
      next: (res: AuthApiResponse) => {
        if (res?.accessToken) {
          this.ts.setAccessTk(res.accessToken, res.expireIn);
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/auth/login'], {
            state: { flash: 'Register success!. Please sign in' },
          });
        }
      },
      error: (e) => {
        const msg =
          typeof e?.error === 'string'
            ? e?.error
            : e?.error ?? e?.error.message ?? 'Failed to register';
        this.errMsg.set(msg);
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }
}
