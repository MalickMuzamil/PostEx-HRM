import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../../core/services/user-service';
import { EmployeeService } from '../../../core/services/employee-service';
import { RoleService } from '../../../core/services/role-service';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth-service';
import { AppValidators } from '../../../core/validators/app-validators-service';
import { Table } from '../../../shared/table/table';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, Table, Pagination],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  AppValidators = AppValidators;

  employees: any[] = [];
  users: any[] = [];
  roles: any[] = [];

  userEmails = new Set<string>();
  userRoleMap = new Map<string, any>();

  filterType = 'all';
  searchTerm = '';

  selectedEmployee: any = null;
  isEditMode = false;
  showPassword = false;
  loading = false;

  currentPage = 1;
  pageSize = 10;

  readonly DEFAULT_PASSWORD = '12345678';
  today = new Date().toISOString().split('T')[0];

  canView = false;
  canCreate = false;
  canUpdate = false;
  canDelete = false;

  newUser = {
    emp_id: null,
    email: '',
    password: this.DEFAULT_PASSWORD,
    role_id: '',
    effective_from: '',
    effective_to: '',
  };

  constructor(
    private userSvc: UserService,
    private empSvc: EmployeeService,
    private roleSvc: RoleService,
    private alert: AlertService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.canView = this.auth.hasPermission('users', 'view');
    this.canCreate = this.auth.hasPermission('users', 'create');
    this.canUpdate = this.auth.hasPermission('users', 'update');
    this.canDelete = this.auth.hasPermission('users', 'delete');

    if (!this.canView) {
      this.alert.error('You do not have permission to view users');
      return;
    }

    this.loadEmployees();
    this.loadUsers();
    this.loadRoles();
  }

  /* ================= LOAD DATA ================= */

  loadEmployees() {
    this.empSvc.getAll().subscribe((res: any) => {
      this.employees = res.data || [];
      if (this.userRoleMap.size) this.mapAccessStatusToEmployees();
    });
  }

  loadUsers() {
    this.userSvc.getUsers().subscribe((res: any) => {
      this.users = res.data || [];

      this.userEmails.clear();
      this.userRoleMap.clear();

      this.users.forEach((u: any) => {
        if (u.email) {
          const email = u.email.toLowerCase();
          this.userEmails.add(email);
          this.userRoleMap.set(email, u);
        }
      });

      this.mapAccessStatusToEmployees();
    });
  }

  loadRoles() {
    this.roleSvc.getRoles().subscribe((res: any) => {
      this.roles = (res.data || []).filter(
        (r: any) => r.is_active === 1 && r.role_name !== 'SuperAdmin'
      );
    });
  }

  private mapAccessStatusToEmployees() {
    this.employees = this.employees.map((emp) => {
      const user = this.userRoleMap.get(emp.email.toLowerCase());
      return {
        ...emp,
        access_status: user?.access_status || 'unassigned',
        role_name: user?.role_name || null,
      };
    });
  }

  /* ================= FILTER ================= */

  filteredEmployees() {
    this.currentPage = 1;
    return this.employees.filter((emp: any) => {
      const nameMatch =
        !this.searchTerm ||
        emp.full_name?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const statusMatch =
        this.filterType === 'all' || emp.access_status === this.filterType;

      return nameMatch && statusMatch;
    });
  }

  /* ================= GRANT ================= */

  openGrantAccess(emp: any) {
    this.isEditMode = false;
    this.selectedEmployee = emp;

    this.newUser = {
      emp_id: emp.emp_id,
      email: emp.email,
      password: this.DEFAULT_PASSWORD,
      role_id: '',
      effective_from: this.today,
      effective_to: '',
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ================= EDIT ================= */

  openEditAccess(emp: any) {
    const user = this.userRoleMap.get(emp.email.toLowerCase());
    if (!user) return;

    this.isEditMode = true;
    this.selectedEmployee = emp;

    this.newUser = {
      emp_id: emp.emp_id,
      email: emp.email,
      password: '', // ✅ no password in edit
      role_id: user.role_id,
      effective_from: this.formatDateForInput(user.effective_from),
      effective_to: this.formatDateForInput(user.effective_to),
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ================= SUBMIT ================= */

  submitUser() {
    if (!this.newUser.role_id) {
      this.alert.warning('Role is required');
      return;
    }

    // effective_from only compulsory in CREATE
    if (!this.isEditMode && !this.newUser.effective_from) {
      this.alert.warning('Effective From date is required');
      return;
    }

    if (
      this.newUser.effective_to &&
      this.newUser.effective_to < this.newUser.effective_from
    ) {
      this.alert.warning('Effective To cannot be before Effective From');
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      /* ===== UPDATE ===== */
      this.userSvc
        .updateUser(
          this.userRoleMap.get(this.newUser.email.toLowerCase()).user_id,
          {
            role_id: this.newUser.role_id,
            effective_from: this.newUser.effective_from,
            effective_to: this.newUser.effective_to || null,
          }
        )
        .subscribe({
          next: () => {
            this.alert.success('User updated successfully');
            this.afterSubmit();
          },
          error: () => {
            this.loading = false;
            this.alert.error('Failed to update user');
          },
        });
    } else {
      /* ===== CREATE ===== */
      const payload = {
        emp_id: this.newUser.emp_id,
        email: this.newUser.email,
        password: this.newUser.password,
        role_id: this.newUser.role_id,
        effective_from: this.newUser.effective_from,
        effective_to: this.newUser.effective_to || null,
      };

      this.userSvc.createUser(payload).subscribe({
        next: () => {
          this.alert.success('User access granted');
          this.afterSubmit();
        },
        error: () => {
          this.loading = false;
          this.alert.error('Failed to grant access');
        },
      });
    }
  }

  afterSubmit() {
    this.resetForm();
    this.loadUsers();
    this.loading = false;
  }

  resetForm() {
    this.selectedEmployee = null;
    this.isEditMode = false;
    this.showPassword = false;

    this.newUser = {
      emp_id: null,
      email: '',
      password: this.DEFAULT_PASSWORD,
      role_id: '',
      effective_from: '',
      effective_to: '',
    };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  revokeAccess(emp: any) {
    const user = this.userRoleMap.get(emp.email.toLowerCase());
    if (!user) return;

    this.alert.confirm(`Revoke access for ${emp.full_name}?`).then((res) => {
      if (!res.isConfirmed) return;

      this.userSvc.deleteUser(user.user_id).subscribe({
        next: () => {
          this.alert.success('Access revoked');
          this.loadUsers();
        },
        error: () => this.alert.error('Failed to revoke access'),
      });
    });
  }

  private formatDateForInput(date: string | null): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  get canShowActions(): boolean {
    return this.canUpdate || this.canDelete;
  }

  get pagedEmployees() {
    const data = this.filteredEmployees();

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    return data.slice(start, end);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}
