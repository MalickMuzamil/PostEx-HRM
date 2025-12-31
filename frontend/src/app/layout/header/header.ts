import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { CommonModule } from '@angular/common';
import { UiLoaderService } from '../../core/services/ui-loader-service';

import posthog from 'posthog-js';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  user: any = null;
  avatarLetter = 'A';
  showDropdown = false;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private ui: UiLoaderService
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      this.avatarLetter = this.user.full_name.charAt(0).toUpperCase();
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  confirmLogout() {
    this.alertService
      .confirm('Are you sure you want to logout?', 'Logout')
      .then((result) => {
        if (!result.isConfirmed) return;

        localStorage.clear();
        this.alertService.success('Logged out successfully');
        posthog.capture('$pageleave');
        posthog.reset();

        setTimeout(() => {
          this.alertService.close();

          this.ui.show();

          setTimeout(() => {
            this.router.navigateByUrl('/login').then(() => {
              this.ui.hide();
            });
          }, 600);
        }, 900);
      });
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('sidebar-open');
  }
}
