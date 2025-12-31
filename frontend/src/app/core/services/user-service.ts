import { Injectable } from '@angular/core';
import { GeneralService } from './general-service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private general: GeneralService) {}

  getUsers() {
    return this.general.get('users');
  }

  createUser(payload: any) {
    return this.general.post('users', payload);
  }

  changeRole(payload: { user_id: number; role_id: number }) {
    return this.general.put('users/change-role', payload);
  }

  toggleStatus(userId: number, is_active: number) {
    return this.general.put(`users/${userId}/status`, { is_active });
  }

  updateUser(userId: number, payload: any) {
    return this.general.put(`users/${userId}`, payload);
  }

  deleteUser(user_id: number) {
    return this.general.delete('users', user_id);
  }
}
