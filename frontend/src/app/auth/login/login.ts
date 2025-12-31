import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { CommonModule } from '@angular/common';

import posthog from 'posthog-js';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  form!: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submit() {
    if (this.form.invalid) {
      this.alert.error('Please enter valid email & password');
      return;
    }

    this.loading = true;

    this.auth.login(this.form.value).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem(
          'permissions',
          JSON.stringify(res.data.permissions || [])
        );

        posthog.identify(res.data.user.user_id.toString(), {
          $name: res.data.user.full_name,
          email: res.data.user.email,
          role_id: res.data.user.role_id,
        });

        this.loading = false;
        this.alert.success('Login successful');

        // 🔑 Force password update ONLY case
        if (res.data.user.is_password_updated === 0) {
          this.router.navigateByUrl('/update-password', { replaceUrl: true });
          return;
        }

        this.auth.checkAuthOnLoad().then(() => {
          this.router.navigateByUrl('/', { replaceUrl: true });
        });
      },
      error: (err) => {
        this.alert.error(err.error?.message || 'Login failed');
        this.loading = false;
      },
    });
  }
}
