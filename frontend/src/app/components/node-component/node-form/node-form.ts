import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NodeService } from '../../../core/services/node-service';
import { AlertService } from '../../../core/services/alert.service';
import { EntityService } from '../../../core/services/entity-service';
import { AppValidators } from '../../../core/validators/app-validators-service';

@Component({
  selector: 'app-node-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './node-form.html',
  styleUrl: './node-form.css',
})
export class NodeForm {

  AppValidators = AppValidators;

  @Input() editData: any = null;
  @Output() close = new EventEmitter<boolean>();

  form: any;
  entityTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private service: NodeService,
    private entityService: EntityService,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      type_id: ['', Validators.required],
      node_name: [
        '',
        [
          Validators.required,
          AppValidators.onlyAlphabets(),
          AppValidators.maxLen(15),
        ],
      ],
      shortcode: [
        '',
        [
          Validators.required,
          AppValidators.onlyAlphabets(),
          AppValidators.maxLen(3),
        ],
      ],
    });

    this.loadEntityTypes();

    if (this.editData) {
      this.form.patchValue(this.editData);
    }
  }

  loadEntityTypes() {
    this.entityService.getAll().subscribe((res: any) => {
      this.entityTypes = res.data;
    });
  }

  save() {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.editData) {
      this.service.update(this.editData.node_id, payload).subscribe({
        next: () => {
          this.alert.success('Node updated');
          this.close.emit(true);
        },
        error: (err: any) => {
          this.alert.error(err?.error?.message || 'Failed to update node');
        },
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => {
          this.alert.success('Node created');
          this.close.emit(true);
        },
        error: (err) => {
          this.alert.error(err?.error?.message || 'Failed to create node');
        },
      });
    }
  }

  cancel() {
    this.close.emit(false);
  }
}
