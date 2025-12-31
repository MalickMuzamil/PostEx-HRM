import { Injectable } from '@angular/core';
import { GeneralService } from './general-service';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private endpoint = 'employees';

  constructor(private general: GeneralService) {}

  getAll() {
    return this.general.get(this.endpoint);
  }

  create(payload: any) {
    return this.general.post(this.endpoint, payload);
  }

  delete(id: number) {
    return this.general.delete(this.endpoint, id);
  }

  update(id: number, payload: any) {
    return this.general.put(this.endpoint, id, payload);
  }

  getWithoutUser() {
    return this.general.get(`${this.endpoint}/without-user`);
  }
}
