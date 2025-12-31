import { Injectable } from '@angular/core';
import { GeneralService } from './general-service';

@Injectable({
  providedIn: 'root',
})
export class CombinationService {
  private endpoint = 'combinations';

  constructor(private general: GeneralService) {}

  getByHierarchy(fh_id: number) {
    return this.general.get(`${this.endpoint}/${fh_id}`);
  }

  create(payload: any) {
    return this.general.post(this.endpoint, payload);
  }

  update(id: number, payload: any) {
    return this.general.put(`${this.endpoint}/${id}`, payload);
  }

  delete(id: number) {
    return this.general.delete(this.endpoint, id);
  }

  getAll() {
    return this.general.get('combinations/all');
  }
}
