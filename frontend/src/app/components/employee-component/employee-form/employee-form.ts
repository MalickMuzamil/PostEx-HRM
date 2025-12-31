import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee-service';
import { CombinationService } from '../../../core/services/combination-service';
import { AlertService } from '../../../core/services/alert.service';
import { AppValidators } from '../../../core/validators/app-validators-service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-form.html',
  styleUrls: ['./employee-form.css'],
})
export class EmployeeForm implements OnInit {
  AppValidators = AppValidators;

  @Output() close = new EventEmitter<boolean>();
  @Input() data: any = null;

  combinations: any[] = [];
  selectedCombination: any = null;

  model: any = {
    full_name: '',
    email: '',
    phone: '',
    cnic: '',
    gender: '',
    comb_id: '',
    department: '',
    designation: '',
    fh_id: '',
  };

  constructor(
    private combSvc: CombinationService,
    private empSvc: EmployeeService,
    private alert: AlertService
  ) {}

  ngOnInit() {
    this.loadAllCombinations();
  }

  /* =====================
   * LOAD COMBINATIONS
   * ===================== */
  loadAllCombinations() {
    this.combSvc.getAll().subscribe((res: any) => {
      this.combinations = res.data || [];

      // EDIT MODE
      if (this.data) {
        this.model = { ...this.data };
        this.model.cnic = this.formatCnic(this.model.cnic);

        this.selectedCombination = this.combinations.find(
          (c) => c.comb_id === this.data.comb_id
        );
      }
    });
  }

  /* =====================
   * COMBINATION
   * ===================== */
  formatPath(path: any[]) {
    return path.map((p) => `${p.type_name} → ${p.node_name}`).join(' | ');
  }

  selectCombination(c: any) {
    this.model.comb_id = c.comb_id;
    this.selectedCombination = c;
  }

  /* =====================
   * CNIC
   * ===================== */
  onCnicChange(event: any) {
    let value = event.target.value;
    let digits = value.replace(/\D/g, '').substring(0, 13);

    if (digits.length <= 5) {
      value = digits;
    } else if (digits.length <= 12) {
      value = digits.replace(/^(\d{5})(\d+)/, '$1-$2');
    } else {
      value = digits.replace(/^(\d{5})(\d{7})(\d)/, '$1-$2-$3');
    }

    this.model.cnic = value;
  }

  formatCnic(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return digits.replace(/^(\d{5})(\d+)/, '$1-$2');
    return digits.replace(/^(\d{5})(\d{7})(\d)/, '$1-$2-$3');
  }

  /* =====================
   * PHONE (03xxxxxxxxx)
   * ===================== */

  initPhone() {
    if (!this.model.phone) {
      this.model.phone = '03';
    }
  }

  allowPhone(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    // block deleting "03"
    if (
      (event.key === 'Backspace' || event.key === 'Delete') &&
      input.selectionStart !== null &&
      input.selectionStart <= 2
    ) {
      event.preventDefault();
      return;
    }

    if (allowed.includes(event.key)) return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    if (input.value.length >= 11) {
      event.preventDefault();
    }
  }

  handlePhonePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const digits = pasted.replace(/\D/g, '');

    if (!digits.startsWith('03')) {
      this.alert.error('Phone number must start with 03');
      return;
    }

    this.model.phone = digits.slice(0, 11);
  }

  /* =====================
   * SAVE
   * ===================== */
  save() {
    // REQUIRED FIELDS
    if (
      !this.model.full_name ||
      !this.model.email ||
      !this.model.phone ||
      !this.model.cnic ||
      !this.model.gender ||
      !this.model.comb_id ||
      !this.model.department ||
      !this.model.designation
    ) {
      this.alert.error('Please fill all required fields');
      return;
    }

    // EMAIL VALIDATION
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(this.model.email)) {
      this.alert.error('Please enter a valid email address');
      return;
    }

    // PHONE VALIDATION
    if (!/^03\d{9}$/.test(this.model.phone)) {
      this.alert.error('Phone number must start with 03 and be 11 digits');
      return;
    }

    // CNIC VALIDATION
    const cleanCnic = this.model.cnic.replace(/\D/g, '');
    if (cleanCnic.length !== 13) {
      this.alert.error('CNIC must be 13 digits');
      return;
    }

    const payload = {
      ...this.model,
      cnic: cleanCnic,
    };

    // UPDATE
    if (this.data) {
      this.empSvc.update(this.data.emp_id, payload).subscribe({
        next: () => {
          this.alert.success('Employee updated');
          this.close.emit(true);
        },
        error: () => this.alert.error('Update failed'),
      });
      return;
    }

    // CREATE
    this.empSvc.create(payload).subscribe({
      next: () => {
        this.alert.success('Employee saved');
        this.close.emit(true);
      },
      error: () => this.alert.error('Save failed'),
    });
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    AppValidators.allowOnlyNumbers(event, 15);
  }
}
