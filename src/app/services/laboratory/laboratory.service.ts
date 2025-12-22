import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LaboratoryResponse } from '../../models/laboratory.model';

@Injectable({
  providedIn: 'root',
})
export class LaboratoryService {
  private base = `${environment.apiBaseUrlLabs}/labs`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<LaboratoryResponse[]> {
    return this.http.get<LaboratoryResponse[]>(`${this.base}`);
  }
}
