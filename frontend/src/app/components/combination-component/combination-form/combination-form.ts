import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CombinationService } from '../../../core/services/combination-service';
import { AlertService } from '../../../core/services/alert.service';
import { NodeService } from '../../../core/services/node-service';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-combination-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './combination-form.html',
  styleUrl: './combination-form.css',
})
export class CombinationForm implements OnInit {
  @Input() hierarchy: any = null;
  @Input() combinations: any[] = [];

  @Output() close = new EventEmitter<boolean>();

  levels: any[] = [];
  canCreate = false;
  canUpdate = false;
  canDelete = false;

  editingCombination: any = null;

  constructor(
    private nodeSvc: NodeService,
    private combSvc: CombinationService,
    private alert: AlertService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.canCreate = this.auth.hasPermission('hierarchy', 'create');
    this.canUpdate = this.auth.hasPermission('hierarchy', 'update');
    this.canDelete = this.auth.hasPermission('hierarchy', 'delete');

    this.loadLevels();
  }

  loadLevels() {
    const rows = this.hierarchy.rows.sort(
      (a: any, b: any) => a.level_order - b.level_order
    );

    this.levels = rows.map((r: any) => ({
      type_id: r.type_id,
      type_name: r.type_name,
      nodes: [],
      node_id: '',
    }));

    this.levels.forEach((lvl) => {
      this.nodeSvc.getByType(lvl.type_id).subscribe((res: any) => {
        lvl.nodes = res.data || [];
      });
    });
  }

  onNodeSelected(index: number) {
    const selected = this.levels.map((l) => l.node_id).filter((x) => x);

    const unique = new Set(selected);
    if (unique.size !== selected.length) {
      this.alert.error('You cannot select same node twice in a path!');
      this.levels[index].node_id = '';
    }
  }

  saveCombination() {
    for (let lvl of this.levels) {
      if (!lvl.node_id) {
        this.alert.error('Please complete full hierarchy path');
        return;
      }
    }

    const payload = {
      fh_id: this.hierarchy.fh_id,
      path: this.levels.map((l) => ({
        type_id: l.type_id,
        node_id: l.node_id,
      })),
    };

    // 🔄 UPDATE MODE
    if (this.editingCombination) {
      this.combSvc.update(this.editingCombination.comb_id, payload).subscribe({
        next: () => {
          this.alert.success('Combination updated');
          this.resetForm();
          this.refreshList();
        },
        error: (err:any) => {
          this.alert.error(err.error?.message || 'Update failed');
        },
      });
      return;
    }

    // ➕ CREATE MODE
    this.combSvc.create(payload).subscribe({
      next: () => {
        this.alert.success('Combination saved');
        this.resetForm();
        this.refreshList();
      },
      error: (err) => {
        this.alert.error(err.error?.message || 'Save failed');
      },
    });
  }

  delete(id: number) {
    this.alert.confirm('Delete this combination?').then((res) => {
      if (!res.isConfirmed) return;

      this.combSvc.delete(id).subscribe({
        next: () => {
          this.alert.success('Deleted');
          this.refreshList(); // reload list after delete
        },
      });
    });
  }

  editCombination(c: any) {
    this.editingCombination = c;
    this.canUpdate = true;

    this.levels.forEach((l) => (l.node_id = ''));

    c.full_path.forEach((p: any, index: number) => {
      if (this.levels[index]) {
        this.levels[index].node_id = p.node_id;
        this.onNodeSelected(index);
      }
    });
  }

  refreshList() {
    this.combSvc.getByHierarchy(this.hierarchy.fh_id).subscribe((res: any) => {
      this.combinations = res.data || [];
    });
  }

  resetForm() {
    this.editingCombination = null;
    this.levels.forEach((l) => (l.node_id = ''));
  }
}
