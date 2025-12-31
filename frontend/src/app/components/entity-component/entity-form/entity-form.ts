import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';
import { EntityService } from '../../../core/services/entity-service';
import { AlertService } from '../../../core/services/alert.service';
import { CommonModule } from '@angular/common';
import { AppValidators } from '../../../core/validators/app-validators-service';

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './entity-form.html',
  styleUrl: './entity-form.css',
})
export class EntityForm {
  AppValidators = AppValidators;

  @Input() editData: any = null;
  @Output() close = new EventEmitter<boolean>();

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: EntityService,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      type_name: [
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

    if (this.editData) {
      this.form.patchValue(this.editData);
    }
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = this.form.value;

    const request$ = this.editData
      ? this.service.update(this.editData.type_id, payload)
      : this.service.create(payload);

    request$.subscribe({
      next: () => {
        this.alert.success(this.editData ? 'Updated' : 'Created');
        this.close.emit(true);
      },
      error: (err: any) => {
        this.alert.error(err.error?.message || 'Something went wrong');
      },
    });
  }

  cancel(): void {
    this.close.emit(false);
  }
}
