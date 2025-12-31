import { Injectable } from '@angular/core';
import { GeneralService } from './general-service';

@Injectable({
  providedIn: 'root',
})
export class BindingService {
  private endpoint = 'bindings';

  constructor(private general: GeneralService) {}

  getAll() {
    return this.general.get(this.endpoint);
  }

  create(payload: any) {
    return this.general.post(this.endpoint, payload);
  }

  update(id: number, payload: any) {
    return this.general.put(this.endpoint, id, payload);
  }

  delete(id: number) {
    return this.general.delete(this.endpoint, id);
  }

  getById(id: number) {
    return this.general.get(`${this.endpoint}/${id}`);
  }
}
