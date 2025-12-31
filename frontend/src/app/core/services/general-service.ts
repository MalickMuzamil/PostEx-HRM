import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get(endpoint: string) {
    return this.http.get(`${this.api}/${endpoint}`);
  }

  getById(endpoint: string, id: number | string) {
    return this.http.get(`${this.api}/${endpoint}/${id}`);
  }

  post(endpoint: string, payload: any) {
    return this.http.post(`${this.api}/${endpoint}`, payload);
  }

  put(endpoint: string, payload: any): any;
  put(endpoint: string, id: number | string, payload: any): any;
  put(endpoint: string, arg1: any, arg2?: any) {

    if (arg2 === undefined) {
      return this.http.put(`${this.api}/${endpoint}`, arg1);
    }

    return this.http.put(`${this.api}/${endpoint}/${arg1}`, arg2);
  }

  delete(endpoint: string, id: number | string) {
    return this.http.delete(`${this.api}/${endpoint}/${id}`);
  }
}
