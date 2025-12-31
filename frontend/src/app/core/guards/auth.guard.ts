import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth-service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private auth: AuthService) {}

  private checkAccess(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    if (user.is_password_updated === 0) {
      this.router.navigate(['/update-password']);
      return false;
    }

    const permission = route.data?.['permission'];

    if (permission && !this.auth.hasPermission(permission, 'view')) {
      this.router.navigate(['/forbidden']);
      return false;
    }

    return true;
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.checkAccess(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    return this.checkAccess(route);
  }
}
