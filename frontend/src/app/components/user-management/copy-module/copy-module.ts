import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../core/services/role-service';
import { RoleRightsService } from '../../../core/services/role-rights-service';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-copy-module',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './copy-module.html',
  styleUrl: './copy-module.css',
})
export class CopyModule implements OnInit {
  roles: any[] = [];
  assignedRights: any[] = [];
  sourceRoles: any[] = [];
  sourceRoleId: any = '';
  targetRoleId: any = '';
  canView = false;
  canCreate = false;

  constructor(
    private roleService: RoleService,
    private roleRightsService: RoleRightsService,
    private alert: AlertService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.canView = this.auth.hasPermission(
      'user-management/role-rights/copy',
      'view'
    );
    this.canCreate = this.auth.hasPermission(
      'user-management/role-rights/copy',
      'create'
    );

    if (!this.canView) {
      this.alert.error('You do not have permission to access this page');
      return;
    }

    this.roleRightsService.getAssignedRights().subscribe({
      next: (res: any) => {
        this.assignedRights = res.data || [];
        this.loadRoles();
      },
      error: () => this.alert.error('Failed to load assigned rights'),
    });
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (res: any) => {
        const activeRoles = (res.data || []).filter(
          (r: any) => r.is_active === 1 && r.role_name !== 'SuperAdmin'
        );

        const rolesWithRights = new Set(
          this.assignedRights.map((r: any) => r.role_id)
        );

        this.sourceRoles = activeRoles.filter((r: any) =>
          rolesWithRights.has(r.role_id)
        );

        this.roles = activeRoles;
      },
      error: () => this.alert.error('Failed to load roles'),
    });
  }

  copyRights() {
    // 1️⃣ Source required
    if (!this.sourceRoleId) {
      this.alert.error('Please select a source role');
      return;
    }

    // 2️⃣ Target required
    if (!this.targetRoleId) {
      this.alert.error('Please select a target role');
      return;
    }

    // 3️⃣ Same role check (already correct)
    if (this.sourceRoleId === this.targetRoleId) {
      this.alert.error('Source and target role cannot be the same');
      return;
    }

    // 4️⃣ Permission check
    if (!this.canCreate) {
      this.alert.error('You do not have permission to copy role rights');
      return;
    }

    // 5️⃣ Confirm destructive action
    this.alert
      .confirm(
        'This will REPLACE all existing rights of the target role. Do you want to continue?'
      )
      .then((result) => {
        if (!result.isConfirmed) return;

        const payload = {
          from_role_id: this.sourceRoleId,
          to_role_id: this.targetRoleId,
          mode: 'replace',
        };

        this.roleRightsService.copyRoleRights(payload).subscribe({
          next: () => {
            this.alert.success('Role rights copied successfully');
            this.sourceRoleId = '';
            this.targetRoleId = '';
          },
          error: () => {
            this.alert.error('Failed to copy role rights');
          },
        });
      });
  }

  onSourceChange() {
    if (+this.sourceRoleId === +this.targetRoleId) {
      this.targetRoleId = '';
    }
  }
}
