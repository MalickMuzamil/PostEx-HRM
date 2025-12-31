import { Injectable } from '@angular/core';
import { GeneralService } from './general-service';

@Injectable({ providedIn: 'root' })
export class RoleService {
  constructor(private general: GeneralService) {}

  getRoles() {
    return this.general.get('roles');
  }

  createRole(payload: { role_name: string }) {
    return this.general.post('roles', payload);
  }

  updateStatus(roleId: number, is_active: number) {
    return this.general.put(`roles/${roleId}/status`, { is_active });
  }

  updateRole(roleId: number, payload: { role_name: string }) {
    return this.general.put(`roles/${roleId}`, payload);
  }
}
