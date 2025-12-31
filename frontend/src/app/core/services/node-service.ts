import { Injectable } from '@angular/core';
import { GeneralService } from './general-service';

@Injectable({
  providedIn: 'root',
})
export class NodeService {
  private endpoint = 'nodes';

  constructor(private general: GeneralService) {}

  getAll() {
    return this.general.get(this.endpoint);
  }

  getById(id: number) {
    return this.general.getById(this.endpoint, id);
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

  getByType(type_id: number) {
    return this.general.get(`${this.endpoint}/by-type/${type_id}`);
  }
}
