import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CombinationService } from '../../../core/services/combination-service';
import { BindingService } from '../../../core/services/binding-service';
import { AlertService } from '../../../core/services/alert.service';
import { CombinationForm } from '../combination-form/combination-form';
import { AuthService } from '../../../core/services/auth-service';
import { FormsModule } from '@angular/forms';
import { Table } from '../../../shared/table/table';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-combination-component',
  standalone: true,
  imports: [CommonModule, CombinationForm, FormsModule, Table, Pagination],
  templateUrl: './combination-component.html',
  styleUrl: './combination-component.css',
})
export class CombinationComponent implements OnInit {
  hierarchies: any[] = [];
  combinations: any[] = [];
  selectedHierarchy: any = null;
  statusFilter: string = 'all';

  loading = false;
  showForm = false;

  canView = false;
  canManage = false;

  currentPage = 1;
  pageSize = 10;

  constructor(
    private hierarchySvc: BindingService,
    private combSvc: CombinationService,
    private alert: AlertService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.canView = this.auth.hasPermission('hierarchy', 'view');
    this.canManage =
      this.auth.hasPermission('hierarchy', 'create') ||
      this.auth.hasPermission('hierarchy', 'update') ||
      this.auth.hasPermission('hierarchy', 'delete');

    if (this.canView) {
      this.loadHierarchies();
    }
  }

  /** ---------------------------
   * Status Calculation (Same as functional hierarchy)
   ----------------------------**/
  computeStatus(h: any) {
    const today = new Date().toISOString().split('T')[0];

    if (h.is_active === 0) return 'inactive';

    if (h.effective_from > today) return 'upcoming';

    if (h.effective_to && h.effective_to < today) return 'inactive';

    return 'active';
  }

  /** ---------------------------
   * Load All Hierarchies
   ----------------------------**/
  loadHierarchies() {
    this.loading = true;

    this.hierarchySvc.getAll().subscribe({
      next: (res: any) => {
        this.hierarchies = (res.data || []).map((h: any) => ({
          ...h,
          status: this.computeStatus(h),
          short_name: h.hierarchy_name,
        }));

        this.loading = false;
      },
      error: () => {
        this.alert.error('Failed to fetch hierarchies');
        this.loading = false;
      },
    });
  }

  /** ---------------------------
   * Open Combination Manager
   ----------------------------**/
  open(h: any) {
    this.selectedHierarchy = h;
    this.loadCombinations(h.fh_id);
    this.showForm = true;
  }

  /** ---------------------------
   * Load Combinations for Hierarchy
   ----------------------------**/
  loadCombinations(fh_id: number) {
    this.combSvc.getByHierarchy(fh_id).subscribe((res: any) => {
      this.combinations = res.data || [];
    });
  }

  /** ---------------------------
   * Close Modal
   ----------------------------**/
  onClose(refresh: boolean) {
    this.showForm = false;
    this.selectedHierarchy = null;

    if (refresh) this.loadHierarchies();
  }

  filteredHierarchies() {
    this.currentPage = 1;
    if (this.statusFilter === 'all') {
      return this.hierarchies;
    }

    return this.hierarchies.filter((h) => h.status === this.statusFilter);
  }

  get canShowActions(): boolean {
    return this.canManage;
  }

  get pagedHierarchies() {
    const data = this.filteredHierarchies();

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    return data.slice(start, end);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}
