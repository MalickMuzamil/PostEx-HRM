import { Injectable } from '@angular/core';
import { GeneralService } from '../services/general-service';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private endpoint = 'entity-types';

  constructor(private generalService: GeneralService) {}

  getAll() {
    return this.generalService.get(this.endpoint);
  }

  getById(id: number) {
    return this.generalService.getById(this.endpoint, id);
  }

  create(payload: any) {
    return this.generalService.post(this.endpoint, payload);
  }

  update(id: number, payload: any) {
    return this.generalService.put(this.endpoint, id, payload);
  }

  delete(id: number) {
    return this.generalService.delete(this.endpoint, id);
  }
}
