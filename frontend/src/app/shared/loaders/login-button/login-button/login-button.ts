import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-button',
  imports: [CommonModule],
  templateUrl: './login-button.html',
  styleUrl: './login-button.css',
})
export class LoginButton {
  @Input() loading = false;
  @Input() disabled = false;
  @Input() btnClass = 'btn-dark';

  @Output() clicked = new EventEmitter<void>();

  onClick() {
    if (!this.loading && !this.disabled) {
      this.clicked.emit();
    }
  }
}
