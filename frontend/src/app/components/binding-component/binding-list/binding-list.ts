import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BindingService } from '../../../core/services/binding-service';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth-service';
import { Table } from '../../../shared/table/table';

@Component({
  selector: 'app-binding-list',
  standalone: true,
  imports: [CommonModule, RouterModule, Table],
  templateUrl: './binding-list.html',
  styleUrl: './binding-list.css',
})
export class BindingList implements OnInit {
  loading = true;
  data: any = null;

  canView = false;
  canCreate = false;
  canUpdate = false;
  canDelete = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: BindingService,
    private alert: AlertService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.canView = this.auth.hasPermission('relationships', 'view');

    if (!this.canView) {
      this.router.navigate(['/forbidden']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.alert.error('Invalid record ID');
      this.router.navigate(['/relationships']);
      return;
    }

    this.service.getById(+id).subscribe({
      next: (res: any) => {
        this.data = res.data || res;
        this.data.status = this.computeStatus(this.data);
        this.loading = false;
      },
      error: (err) => {
        this.alert.error(err.error?.message || 'Failed to load record');
        this.loading = false;
      },
    });
  }

  /* ===============================
     STATUS HELPER
     =============================== */
  computeStatus(h: any): 'active' | 'inactive' | 'upcoming' {
    const today = new Date().toISOString().split('T')[0];

    if (h.is_active === 0) return 'inactive';
    if (h.effective_from > today) return 'upcoming';
    if (h.effective_to && h.effective_to < today) return 'inactive';

    return 'active';
  }

  /* ===============================
     NAVIGATION
     =============================== */
  back(): void {
    this.router.navigate(['/relationships']);
  }
}
