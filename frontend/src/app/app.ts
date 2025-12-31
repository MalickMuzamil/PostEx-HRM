import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth-service';
import { CommonModule } from '@angular/common';
import { AppLoader } from './shared/loaders/app-loader/app-loader';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, AppLoader],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  checkingAuth = signal(true);

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.checkAuthOnLoad();

    this.auth.checkingAuth$.subscribe((checking) => {
      this.checkingAuth.set(checking);

      if (!checking) {
        const token = localStorage.getItem('token');

        if (!token) {
          this.router.navigate(['/login']);
          return;
        }

        if (this.router.url === '/login') {
          const permissions = JSON.parse(
            localStorage.getItem('permissions') || '[]'
          );

          if (permissions.length > 0) {
            this.router.navigate(['/' + permissions[0].route]);
          } else {
            this.router.navigate(['/forbidden']);
          }
        }
      }
    });
  }
}
