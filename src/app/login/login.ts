import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth';
import { TokenService } from '../services/token';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginUser } from '../models/auth/auth.model';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private service = inject(AuthService);
  private ts = inject(TokenService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get c() {
    return this.form.controls;
  }

  pV = signal(false);

  pVC() {
    this.pV.set(!this.pV());
  }

  onLog = signal(false);
  errMsg = signal<string | null>(null);

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.onLog.set(true);
    const v = this.form.getRawValue();
    const payload: LoginUser = {
      email: v.email.trim(),
      password: v.password,
    };

    this.service.login(payload).subscribe({
      next: (res) => {
        if (res?.accessToken) {
          this.ts.setAccessTk(res.accessToken, res.expireIn);
          this.router.navigate(['']);
        }
      },
      error: (e) => {
        const msg =
          typeof e?.error === 'string'
            ? e?.errorlo
            : e?.error ?? e?.error.message ?? 'Failed to register';
        this.errMsg.set(msg);
        this.onLog.set(false);
        if (e.status === 403) {
          this.c.password.setErrors({ server: 'Password is incorrect' });
        } else if (e.status === 404) {
          this.c.email.setErrors({ server: 'Email not found' });
        }
      },
      complete: () => {
        this.onLog.set(false);
      },
    });
  }
}
