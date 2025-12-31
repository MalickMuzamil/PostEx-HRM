import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { CommonModule } from '@angular/common';
import { EntityService } from '../../../core/services/entity-service';
import { EntityForm } from '../entity-form/entity-form';
import { AuthService } from '../../../core/services/auth-service';
import { Table } from '../../../shared/table/table';
import { Pagination } from '../../../shared/pagination/pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-entity-component',
  imports: [CommonModule, EntityForm, Table, Pagination, FormsModule],
  standalone: true,
  templateUrl: './entity-component.html',
  styleUrl: './entity-component.css',
})
export class EntityComponent implements OnInit {
  entityTypes: any = [];
  loading = false;

  showModal = false;
  selected: any = null;
  searchTerm = '';

  filteredEntityTypes: any[] = [];

  currentPage = 1;
  pageSize = 10;

  constructor(
    private service: EntityService,
    private alert: AlertService,
    private auth: AuthService
  ) {}

  canView = false;
  canCreate = false;
  canUpdate = false;
  canDelete = false;

  ngOnInit() {
    this.canView = this.auth.hasPermission('entity-types', 'view');
    this.canCreate = this.auth.hasPermission('entity-types', 'create');
    this.canUpdate = this.auth.hasPermission('entity-types', 'update');
    this.canDelete = this.auth.hasPermission('entity-types', 'delete');

    if (this.canView) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.service.getAll().subscribe((res: any) => {
      this.entityTypes = res.data || [];
      this.filteredEntityTypes = [...this.entityTypes];
      this.currentPage = 1;
      this.loading = false;
    });
  }

  openModal(item: any = null) {
    this.selected = item ? { ...item } : null;
    this.showModal = true;
  }

  closeModal(refresh: boolean = false) {
    this.showModal = false;

    if (refresh) this.load();
  }

  onDelete(id: number) {
    this.alert.confirm('Delete this entity type?').then((result) => {
      if (result.isConfirmed) {
        this.service.delete(id).subscribe(() => {
          this.alert.success('Deleted');
          this.load();
        });
      }
    });
  }

  get canShowActions(): boolean {
    return this.canUpdate || this.canDelete;
  }

  onSearchChange() {
    this.currentPage = 1;

    const term = this.searchTerm.toLowerCase().trim();

    this.filteredEntityTypes = !term
      ? [...this.entityTypes]
      : this.entityTypes.filter((e: any) =>
          e.type_name?.toLowerCase().includes(term)
        );
  }

  get pagedEntityTypes() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredEntityTypes.slice(start, end);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}
