import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';
import { AlertService } from '../../core/services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update-password.html',
  styleUrl: './update-password.css',
})
export class UpdatePassword {
  form: FormGroup;
  submitted = false;
  loading = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alert: AlertService,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(12),
            this.strongPasswordValidator,
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  // 🔒 Strong password validator
  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[@$!%*?&]/.test(value);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return { strongPassword: true };
    }

    return null;
  }

  // 🔁 Match password & confirm password
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;

    return password === confirm ? null : { passwordMismatch: true };
  }

  // strongly typed controls (fixes template error)
  get f() {
    return this.form.controls as {
      newPassword: AbstractControl;
      confirmPassword: AbstractControl;
    };
  }

  // ✅ FINAL SUBMIT LOGIC
  submit() {
    this.submitted = true;

    if (this.form.invalid || this.loading) {
      return;
    }

    this.loading = true;

    this.authService
      .updatePassword({ newPassword: this.form.value.newPassword })
      .subscribe({
        next: () => {
          this.loading = false;

          this.alert.success(
            'Password updated successfully. Please login again.'
          );

          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 1200);
        },
        error: (err) => {
          this.loading = false;
          this.alert.error(err?.error?.message || 'Failed to update password');
        },
      });
  }
}
