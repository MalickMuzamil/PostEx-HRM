import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BindingService } from '../../../core/services/binding-service';
import { NodeService } from '../../../core/services/node-service';
import { EntityService } from '../../../core/services/entity-service';
import { AlertService } from '../../../core/services/alert.service';
import { BindingForm } from '../binding-form/binding-form';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { Table } from '../../../shared/table/table';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-binding-component',
  standalone: true,
  imports: [
    CommonModule,
    BindingForm,
    ReactiveFormsModule,
    FormsModule,
    Table,
    Pagination,
  ],
  templateUrl: './binding-component.html',
  styleUrl: './binding-component.css',
})
export class BindingComponent implements OnInit {
  hierarchies: any[] = [];
  filteredHierarchies: any[] = [];
  nodes: any[] = [];
  entityTypes: any[] = [];

  loading = false;
  showForm = false;
  selectedHierarchy: any = null;

  statusFilter = '';

  canView = false;
  canCreate = false;
  canUpdate = false;
  canDelete = false;
  canViewList = false;
  canViewHierarchy = false;

  currentPage = 1;
  pageSize = 10;

  constructor(
    private svc: BindingService,
    private nodeSvc: NodeService,
    private entitySvc: EntityService,
    private alert: AlertService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.canViewList = this.auth.hasPermission('relationships', 'view');

    this.canViewHierarchy = this.auth.hasPermission('relationships', 'view');

    this.canCreate = this.auth.hasPermission('relationships', 'create');
    this.canUpdate = this.auth.hasPermission('relationships', 'update');
    this.canDelete = this.auth.hasPermission('relationships', 'delete');

    if (this.canViewList) {
      this.loadAll();
    }
  }

  loadAll() {
    this.loading = true;

    this.svc.getAll().subscribe({
      next: (res: any) => {
        this.hierarchies = res.data.map((h: any) => ({
          ...h,
          name: `H-${h.fh_id}`,
          status: this.computeStatus(h),
        }));
        this.filteredHierarchies = this.hierarchies;
        this.loading = false;
      },
      error: () => {
        this.alert.error('Failed to load hierarchies');
        this.loading = false;
      },
    });

    this.nodeSvc.getAll().subscribe((r: any) => (this.nodes = r.data));
    this.entitySvc.getAll().subscribe((r: any) => (this.entityTypes = r.data));
  }

  computeStatus(h: any) {
    const today = new Date().toISOString().split('T')[0];

    if (h.is_active === 0) return 'inactive';

    if (h.effective_from > today) return 'upcoming';

    if (h.effective_to && h.effective_to < today) return 'inactive';

    return 'active';
  }

  openForm() {
    this.selectedHierarchy = null;
    this.showForm = true;
  }

  edit(h: any) {
    this.selectedHierarchy = JSON.parse(JSON.stringify(h));
    this.showForm = true;
  }

  viewDetails(id: number) {
    this.router.navigate(['/relationships', id]);
  }

  delete(id: number) {
    this.alert.confirm('Delete this hierarchy?').then((res) => {
      if (res.isConfirmed) {
        this.svc.delete(id).subscribe(() => {
          this.alert.success('Deleted');
          this.loadAll();
        });
      }
    });
  }

  onFormClose(refresh: boolean) {
    this.showForm = false;
    if (refresh) this.loadAll();
  }

  get pagedHierarchies() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredHierarchies.slice(start, end);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  applyFilter() {
    this.currentPage = 1; 

    if (!this.statusFilter) {
      this.filteredHierarchies = this.hierarchies;
      return;
    }
    this.filteredHierarchies = this.hierarchies.filter(
      (h) => h.status === this.statusFilter
    );
  }
}
