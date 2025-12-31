import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee-service';
import { AlertService } from '../../../core/services/alert.service';
import { EmployeeForm } from '../employee-form/employee-form';
import { AuthService } from '../../../core/services/auth-service';
import { Table } from '../../../shared/table/table';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-employee-component',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeForm, Table, Pagination],
  templateUrl: './employee-component.html',
  styleUrl: './employee-component.css',
})
export class EmployeeComponent implements OnInit {
  employees: any[] = [];
  showForm = false;
  editingEmployee: any = null;

  canView = false;
  canCreate = false;
  canUpdate = false;
  canDelete = false;

  currentPage = 1;
  pageSize = 10;

  constructor(
    private empSvc: EmployeeService,
    private alert: AlertService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.canView = this.auth.hasPermission('employees', 'view');
    this.canCreate = this.auth.hasPermission('employees', 'create');
    this.canUpdate = this.auth.hasPermission('employees', 'update');
    this.canDelete = this.auth.hasPermission('employees', 'delete');

    if (this.canView) {
      this.loadEmployees();
    }
  }

  loadEmployees() {
    this.empSvc.getAll().subscribe((res: any) => {
      this.employees = res.data || [];
      this.currentPage = 1;
    });
  }

  openForm(emp: any = null) {
    this.editingEmployee = emp;
    this.showForm = true;
  }

  onFormClose(refresh: boolean) {
    this.showForm = false;
    this.editingEmployee = null;

    if (refresh) this.loadEmployees();
  }

  delete(id: number) {
    this.alert.confirm('Delete this employee?').then((res) => {
      if (!res.isConfirmed) return;

      this.empSvc.delete(id).subscribe(() => {
        this.alert.success('Deleted');
        this.loadEmployees();
      });
    });
  }

  get canShowActions(): boolean {
    return this.canUpdate || this.canDelete;
  }

  get pagedEmployees() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.employees.slice(start, end);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}
