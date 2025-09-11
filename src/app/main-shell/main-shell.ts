import { Component, inject } from '@angular/core';
import { TokenService } from '../services/token';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-shell',
  standalone: false,
  templateUrl: './main-shell.html',
  styleUrl: './main-shell.css',
})
export class MainShell {
  private ts = inject(TokenService);
  private service = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.service.logout().subscribe({
      next: () => {
        this.ts.clear();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.ts.clear();
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
