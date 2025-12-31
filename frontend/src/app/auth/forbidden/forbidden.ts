import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [CommonModule],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css',
})
export class Forbidden {
  loading = false;

  constructor(private router: Router) {}

  goBack() {
    if (this.loading) return;

    this.loading = true;

    setTimeout(() => {
      window.location.href = '/';
    }, 400); // 👈 smooth UX
  }
}
