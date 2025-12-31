import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeService } from '../../../core/services/node-service';
import { AlertService } from '../../../core/services/alert.service';
import { NodeForm } from '../node-form/node-form';
import { AuthService } from '../../../core/services/auth-service';
import { Table } from '../../../shared/table/table';
import { Pagination } from '../../../shared/pagination/pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-node-component',
  imports: [NodeForm, CommonModule, Table, Pagination, FormsModule],
  templateUrl: './node-component.html',
  styleUrl: './node-component.css',
})
export class NodeComponent implements OnInit {
  nodes: any[] = [];
  loading = false;

  showModal = false;
  selected: any = null;

  canView = false;
  canCreate = false;
  canUpdate = false;
  canDelete = false;

  searchTerm = '';

  filteredNodes: any[] = [];
  currentPage = 1;
  pageSize = 10;

  constructor(
    private service: NodeService,
    private alert: AlertService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.canView = this.auth.hasPermission('nodes', 'view');
    this.canCreate = this.auth.hasPermission('nodes', 'create');
    this.canUpdate = this.auth.hasPermission('nodes', 'update');
    this.canDelete = this.auth.hasPermission('nodes', 'delete');

    if (this.canView) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (res: any) => {
        this.nodes = res.data || [];
        this.filteredNodes = [...this.nodes];
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('Failed to load nodes');
      },
    });
  }

  openModal(item: any = null) {
    this.selected = item;
    this.showModal = true;
  }

  closeModal(refresh: boolean = false) {
    this.showModal = false;
    if (refresh) this.load();
  }

  delete(id: number) {
    this.alert.confirm('Delete this node?').then((result) => {
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

  get pagedNodes() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredNodes.slice(start, end);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onSearchChange() {
    this.currentPage = 1;

    const term = this.searchTerm.toLowerCase().trim();

    this.filteredNodes = !term
      ? [...this.nodes]
      : this.nodes.filter((n) => n.node_name?.toLowerCase().includes(term));
  }
}
