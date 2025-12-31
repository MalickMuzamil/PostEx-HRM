import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeneralService } from './general-service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private checkingAuthSubject = new BehaviorSubject(true);
  checkingAuth$ = this.checkingAuthSubject.asObservable();
  isLoggedOut = false;

  constructor(private general: GeneralService) {}

  get user() {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }

  /* =====================
     AUTH
     ===================== */
  login(payload: any) {
    return this.general.post('auth/login', payload);
  }

  verifyToken() {
    return this.general.get('auth/verify');
  }

  updatePassword(payload: { newPassword: string }) {
    return this.general.post('auth/update-password', payload);
  }

  logout() {
    this.isLoggedOut = true;
    localStorage.clear();
  }

  checkAuthOnLoad(): Promise<void> {
    return new Promise((resolve) => {
      const token = localStorage.getItem('token');

      if (!token) {
        this.checkingAuthSubject.next(false);
        resolve();
        return;
      }

      this.verifyToken().subscribe({
        next: () => {
          this.getUserPermissions().subscribe({
            next: (perms: any) => {
              localStorage.setItem('permissions', JSON.stringify(perms));
              this.checkingAuthSubject.next(false);
              resolve();
            },
            error: () => {
              this.logout();
              this.checkingAuthSubject.next(false);
              resolve();
            },
          });
        },
        error: () => {
          this.logout();
          this.checkingAuthSubject.next(false);
          resolve();
        },
      });
    });
  }

  /* =====================
     PERMISSIONS
     ===================== */
  getUserPermissions() {
    return this.general.get('auth/permissions');
  }

  hasPermission(
    route: string,
    action: 'view' | 'create' | 'update' | 'delete'
  ): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'SuperAdmin') {
      return true; // 🔥 FULL ACCESS
    }

    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');

    return permissions.some(
      (p: any) => p.route === route && p.actions.includes(action)
    );
  }

  canAccessRoute(route: string): boolean {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');

    return permissions.some((p: any) => p.route === route);
  }

  refreshPermissions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getUserPermissions().subscribe({
        next: (perms: any) => {
          localStorage.setItem('permissions', JSON.stringify(perms));
          resolve();
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  hasAnyPermission(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user.role === 'SuperAdmin') {
      return true;
    }

    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    return permissions.length > 0;
  }

  get loggedInRoleId(): number | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role_id || null;
  }
}
