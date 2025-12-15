import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnalysisRequest,
  AnalysisRequestResponse,
} from '../../models/analysis.model';

@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  private base = `${environment.apiBaseUrl}/analysis`;

  constructor(private http: HttpClient) {}

  createRequest(body: AnalysisRequest): Observable<AnalysisRequestResponse> {
    return this.http.post<AnalysisRequestResponse>(
      `${this.base}/request`,
      body
    );
  }

  byPatient(patientId: number): Observable<AnalysisRequestResponse[]> {
    return this.http.get<AnalysisRequestResponse[]>(
      `${this.base}/patient/${patientId}`
    );
  }
  byLaboratory(laboratoryId: number): Observable<AnalysisRequestResponse[]> {
    return this.http.get<AnalysisRequestResponse[]>(
      `${this.base}/laboratory/${laboratoryId}`
    );
  }
  byDoctor(doctorUserId: number): Observable<AnalysisRequestResponse[]> {
    return this.http.get<AnalysisRequestResponse[]>(
      `${this.base}/doctor/${doctorUserId}`
    );
  }

  getById(id: number): Observable<AnalysisRequestResponse> {
    return this.http.get<AnalysisRequestResponse>(`${this.base}/${id}`);
  }

  update(
    id: number,
    body: AnalysisRequest
  ): Observable<AnalysisRequestResponse> {
    return this.http.put<AnalysisRequestResponse>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
