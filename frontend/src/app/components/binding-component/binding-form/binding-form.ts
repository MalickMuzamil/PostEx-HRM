import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BindingService } from '../../../core/services/binding-service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-binding-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './binding-form.html',
  styleUrl: './binding-form.css',
})
export class BindingForm {
  today = new Date().toISOString().split('T')[0];
  tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  @Input() editData: any = null;
  @Input() nodes: any[] = [];
  @Input() entityTypes: any[] = [];

  @Output() close = new EventEmitter<boolean>();

  rows: any[] = [];
  isActive = true;
  saving = false;

  effective_from = '';
  effective_to: string | null = null;
  originalState: string = '';

  constructor(private alert: AlertService, private svc: BindingService) {}

  ngOnInit() {
    if (this.editData) {
      this.rows = this.editData.rows.map((r: any) => ({ ...r }));
      this.isActive = !!this.editData.is_active;

      this.effective_from = this.formatDate(this.editData.effective_from);
      this.effective_to = this.editData.effective_to
        ? this.formatDate(this.editData.effective_to)
        : null;
    } else {
      this.rows = [this._emptyRow()];
    }

    this.ensureTrailingRow();

    this.originalState = this.serializeState();
  }

  // Create empty row
  _emptyRow() {
    return { type_id: '', node_id: '', _touched: false };
  }

  // Handle row change
  onRowChange(i: number) {
    const row = this.rows[i];
    row._touched = true;

    // If type changed → reset node if not matching
    if (row.type_id) {
      const validNodes = this.getNodesForRow(row.type_id);
      if (!validNodes.some((n) => n.node_id === row.node_id)) {
        row.node_id = '';
      }
    }

    // Auto add row when last has input
    const hasValue = row.type_id || row.node_id;
    if (this.isLast(i) && hasValue) this.rows.push(this._emptyRow());

    this.trimTrailingEmpty();
  }

  // Prevent duplicate type selection
  getAvailableTypes(index: number) {
    const used = this.rows
      .map((r, i) => (i !== index ? r.type_id : null))
      .filter((id) => id);

    return this.entityTypes.filter((t) => !used.includes(t.type_id));
  }

  // Filter nodes based on type
  getNodesForRow(type_id: any) {
    if (!type_id) return [];
    return this.nodes.filter((n) => n.type_id === type_id);
  }

  // Helpers
  isLast(i: number) {
    return i === this.rows.length - 1;
  }

  trimTrailingEmpty() {
    while (this.rows.length > 1) {
      const last = this.rows[this.rows.length - 1];
      const prev = this.rows[this.rows.length - 2];
      if (!last.type_id && !last.node_id && !prev.type_id && !prev.node_id)
        this.rows.pop();
      else break;
    }
  }

  // VALIDATION
  validate() {
    // 1 — inactive not allowed
    if (!this.isActive && !this.editData) {
      this.alert.error('Inactive hierarchy cannot be created.');
      return false;
    }

    // 2 — cannot deactivate on edit
    if (!this.isActive && this.editData) {
      this.alert.error('You cannot deactivate a hierarchy. Delete instead.');
      return false;
    }

    // 3 — effective from must be in future
    if (!this.effective_from || this.effective_from <= this.today) {
      this.alert.error('Effective From must be a future date.');
      return false;
    }

    // 4 — effective to must be after effective from
    if (this.effective_to && this.effective_to <= this.effective_from) {
      this.alert.error('Effective To must be later than Effective From.');
      return false;
    }

    // 5 — at least one valid row
    const valid = this.rows.filter((r) => r.type_id && r.node_id);
    if (valid.length === 0) {
      this.alert.error('Add at least one valid row.');
      return false;
    }

    return true;
  }

  // Payload
  buildPayload() {
    return {
      fh_id: this.editData?.fh_id || null,
      is_active: this.isActive ? 1 : 0,
      effective_from: this.effective_from,
      effective_to: this.effective_to,
      rows: this.rows
        .filter((r) => r.type_id && r.node_id)
        .map((r, idx) => ({
          level_order: idx + 1,
          type_id: r.type_id,
          node_id: r.node_id,
        })),
    };
  }

  // SAVE
  save() {
    if (!this.validate()) return;

    const payload = this.buildPayload();
    this.saving = true;

    const req = this.editData
      ? this.svc.update(payload.fh_id, payload)
      : this.svc.create(payload);

    req.subscribe({
      next: () => {
        this.alert.success('Saved successfully');
        this.saving = false;
        this.close.emit(true);
      },
      error: (err: any) => {
        this.alert.error(err.error?.message || 'Request failed');
        this.saving = false;
      },
    });
  }

  cancel() {
    this.close.emit(false);
  }

  ensureTrailingRow() {
    const last = this.rows[this.rows.length - 1];
    if (last.type_id || last.node_id) this.rows.push(this._emptyRow());
    this.trimTrailingEmpty();
  }

  formatDate(date: string) {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  serializeState() {
    return JSON.stringify({
      isActive: this.isActive,
      effective_from: this.effective_from,
      effective_to: this.effective_to,
      rows: this.rows
        .filter((r) => r.type_id && r.node_id)
        .map((r) => ({
          type_id: r.type_id,
          node_id: r.node_id,
        })),
    });
  }

  hasChanges(): boolean {
    return this.serializeState() !== this.originalState;
  }
}
