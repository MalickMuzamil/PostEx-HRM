import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  Validators,
} from '@angular/forms';

import { RoleService } from '../../../core/services/role-service';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth-service';
import { AppValidators } from '../../../core/validators/app-validators-service';
import { Table } from '../../../shared/table/table';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, Table, Pagination],
  templateUrl: './role.html',
  styleUrl: './role.css',
})
export class Role {
  AppValidators = AppValidators;

  roleNameCtrl = new FormControl('', [
    Validators.required,
    AppValidators.onlyAlphabets(),
    AppValidators.maxLen(15),
  ]);

  editRoleCtrl = new FormControl('', [
    Validators.required,
    AppValidators.onlyAlphabets(),
    AppValidators.maxLen(15),
  ]);

  roles: any[] = [];
  loading = false;

  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  searchTerm = '';

  editRoleId: number | null = null;
  addingRole = false;
  savingRoleId: number | null = null;
  togglingRoleId: number | null = null;

  canView = false;
  canCreate = false;
  canUpdate = false;
  canDelete = false;

  currentPage = 1;
  pageSize = 10;

  constructor(
    private roleService: RoleService,
    private alert: AlertService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.canView = this.auth.hasPermission('roles', 'view');
    this.canCreate = this.auth.hasPermission('roles', 'create');
    this.canUpdate = this.auth.hasPermission('roles', 'update');
    this.canDelete = this.auth.hasPermission('roles', 'delete');

    if (!this.canView) {
      this.alert.error('You do not have permission to view roles');
      return;
    }

    this.fetchRoles();
  }

  fetchRoles(): void {
    this.loading = true;

    this.roleService.getRoles().subscribe({
      next: (res: any) => {
        const roles = res.data ?? res;
        this.roles = roles.filter((r: any) => r.role_name !== 'SuperAdmin');
        this.loading = false;
      },
      error: () => {
        this.alert.error('Failed to load roles');
        this.loading = false;
      },
    });
  }

  createRole(): void {
    if (this.roleNameCtrl.invalid || this.addingRole) return;

    this.addingRole = true;

    this.roleService
      .createRole({
        role_name: this.roleNameCtrl.value!.trim(),
      })
      .subscribe({
        next: () => {
          this.alert.success('Role created successfully');
          this.roleNameCtrl.reset();
          this.fetchRoles();
          this.addingRole = false;
        },
        error: () => {
          this.alert.error('Failed to create role');
          this.addingRole = false;
        },
      });
  }

  updateStatus(role: any): void {
    if (this.togglingRoleId) return;

    const action = role.is_active ? 'Deactivate' : 'Activate';

    this.alert.confirm(`Do you want to ${action} this role?`).then((res) => {
      if (!res.isConfirmed) return;

      this.togglingRoleId = role.role_id;
      const newStatus = role.is_active ? 0 : 1;

      this.roleService.updateStatus(role.role_id, newStatus).subscribe({
        next: () => {
          role.is_active = newStatus;
          this.alert.success(`Role ${action}d successfully`);
          this.togglingRoleId = null;
        },
        error: () => {
          this.alert.error(`Failed to ${action.toLowerCase()} role`);
          this.togglingRoleId = null;
        },
      });
    });
  }

  startEdit(role: any): void {
    this.editRoleId = role.role_id;
    this.editRoleCtrl.setValue(role.role_name);
  }

  saveEdit(role: any): void {
    if (this.editRoleCtrl.invalid || this.savingRoleId) return;

    this.savingRoleId = role.role_id;

    this.roleService
      .updateRole(role.role_id, {
        role_name: this.editRoleCtrl.value!.trim(),
      })
      .subscribe({
        next: () => {
          role.role_name = this.editRoleCtrl.value;
          this.alert.success('Role updated successfully');
          this.cancelEdit();
          this.savingRoleId = null;
        },
        error: () => {
          this.alert.error('Failed to update role');
          this.savingRoleId = null;
        },
      });
  }

  cancelEdit(): void {
    this.editRoleId = null;
    this.editRoleCtrl.reset();
  }

  get filteredRoles(): any[] {
    let data = [...this.roles];

    if (this.statusFilter === 'active') {
      data = data.filter((r) => r.is_active);
    }

    if (this.statusFilter === 'inactive') {
      data = data.filter((r) => !r.is_active);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter((r) => r.role_name.toLowerCase().includes(term));
    }

    return data;
  }

  get canShowActions(): boolean {
    return this.canUpdate || this.canDelete;
  }

  get pagedRoles(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredRoles.slice(start, end);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}
