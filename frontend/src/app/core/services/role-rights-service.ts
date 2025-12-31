import { Injectable } from '@angular/core';
import { GeneralService } from './general-service';

@Injectable({
  providedIn: 'root',
})
export class RoleRightsService {
  constructor(private general: GeneralService) {}

  /* ---------------- EXISTING ---------------- */

  getApplications() {
    return this.general.get('role-rights/applications');
  }

  getMenus(appId: number) {
    return this.general.get(`role-rights/menus/${appId}`);
  }

  getRoleRights(roleId: number, appId: number) {
    return this.general.get(`role-rights/${roleId}/${appId}`);
  }

  assignRights(payload: any) {
    return this.general.post('role-rights/assign', payload);
  }

  getAssignedRights() {
    return this.general.get('role-rights/assigned');
  }

  deleteAssignedRights(roleId: number, appId: number) {
    return this.general.delete('role-rights', `${roleId}/${appId}`);
  }

  copyRoleRights(payload: any) {
    return this.general.post('role-rights/copy', payload);
  }

  /* ================= NEW (CRUD ACTIONS) ================= */

  getRoleMenuActions(roleId: number, menuId: number) {
    return this.general.get(`role-actions/${roleId}/${menuId}`);
  }

  saveRoleMenuActions(roleId: number, menuId: number, permissions: any) {
    return this.general.post(`role-actions/${roleId}/${menuId}`, {
      permissions,
    });
  }
}
