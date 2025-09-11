import { Component, inject, OnInit, signal } from '@angular/core';
import { TokenService } from './services/token';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
// export class App {
//   protected readonly title = signal('test-s');
// }
export class App implements OnInit {
  protected readonly title = signal('test-s');
  private service = inject(TokenService);

  ngOnInit(): void {
    this.service.bootstrap().subscribe();
  }
}
