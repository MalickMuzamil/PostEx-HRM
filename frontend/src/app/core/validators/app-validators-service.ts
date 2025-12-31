import { Injectable } from '@angular/core';
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class AppValidators {
  /* ======================
   * FORM VALIDATORS
   * ====================== */

  static onlyAlphabets(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return /^[A-Za-z ]+$/.test(control.value)
        ? null
        : { onlyAlphabets: true };
    };
  }

  static onlyNumbers(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return /^[0-9]+$/.test(control.value) ? null : { onlyNumbers: true };
    };
  }

  static alphaNumeric(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return /^[A-Za-z0-9 ]+$/.test(control.value)
        ? null
        : { alphaNumeric: true };
    };
  }

  static maxLen(length: number): ValidatorFn {
    return Validators.maxLength(length);
  }

  /* ======================
   * INPUT RESTRICTION HELPERS
   * (Typing + Paste)
   * ====================== */

  static allowOnlyAlphabets(event: KeyboardEvent, maxLength: number): void {
    const input = event.target as HTMLInputElement;

    if (!/^[A-Za-z ]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    if (input.value.length >= maxLength) {
      event.preventDefault();
    }
  }

  static allowOnlyNumbers(event: KeyboardEvent, maxLength: number): void {
    const input = event.target as HTMLInputElement;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    if (input.value.length >= maxLength) {
      event.preventDefault();
    }
  }

  static handlePaste(
    event: ClipboardEvent,
    type: 'alphabets' | 'numbers' | 'alphanumeric',
    maxLength: number
  ): void {
    event.preventDefault();

    const input = event.target as HTMLInputElement;
    const pasted = event.clipboardData?.getData('text') || '';

    let regex = /[^A-Za-z ]/g;

    if (type === 'numbers') regex = /[^0-9]/g;
    if (type === 'alphanumeric') regex = /[^A-Za-z0-9 ]/g;

    input.value = pasted.replace(regex, '').slice(0, maxLength);
    input.dispatchEvent(new Event('input'));
  }

  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

      return emailRegex.test(control.value) ? null : { emailInvalid: true };
    };
  }
}
