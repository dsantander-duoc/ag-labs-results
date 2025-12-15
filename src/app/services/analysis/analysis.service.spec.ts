import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AnalysisService } from './analysis.service';
import { environment } from '../../../environments/environment';
import {
  AnalysisRequest,
  AnalysisRequestResponse,
  AnalysisRequestStatus,
} from '../../models/analysis.model';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let httpMock: HttpTestingController;

  const base = `${environment.apiBaseUrl}/analysis`;

  const sampleRequest: AnalysisRequest = {
    patientId: 10,
    laboratoryId: 20,
    doctorUserId: 30,
    status: AnalysisRequestStatus.PENDING,
  };

  const sampleResponse: AnalysisRequestResponse = {
    analysisRequestId: 1,
    patientRut: '1234567890',
    laboratoryName: 'Laboratorio 1',
    doctorName: 'Doctor 1',
    status: AnalysisRequestStatus.PENDING,
    requestDate: '2025-12-10T12:01:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnalysisService],
    });
    service = TestBed.inject(AnalysisService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createRequest: should make POST to /request and return response', () => {
    service.createRequest(sampleRequest).subscribe((res) => {
      expect(res).toEqual(sampleResponse);
    });

    const req = httpMock.expectOne(`${base}/request`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(sampleRequest);
    req.flush(sampleResponse);
  });

  it('byPatient: should make GET to /patient/:id', () => {
    const list: AnalysisRequestResponse[] = [sampleResponse];

    service.byPatient(10).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].analysisRequestId).toBe(1);
    });

    const req = httpMock.expectOne(`${base}/patient/10`);
    expect(req.request.method).toBe('GET');
    req.flush(list);
  });

  it('byLaboratory: should make GET to /laboratory/:id', () => {
    const list: AnalysisRequestResponse[] = [sampleResponse];

    service.byLaboratory(20).subscribe((res) => {
      expect(res).toEqual(list);
    });

    const req = httpMock.expectOne(`${base}/laboratory/20`);
    expect(req.request.method).toBe('GET');
    req.flush(list);
  });

  it('byDoctor: should make GET to /doctor/:id', () => {
    const list: AnalysisRequestResponse[] = [sampleResponse];

    service.byDoctor(30).subscribe((res) => {
      expect(res[0].doctorName).toBe('Doctor 1');
    });

    const req = httpMock.expectOne(`${base}/doctor/30`);
    expect(req.request.method).toBe('GET');
    req.flush(list);
  });

  it('getById: should make GET to /:id', () => {
    service.getById(1).subscribe((res) => {
      expect(res.analysisRequestId).toBe(1);
    });

    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(sampleResponse);
  });

  it('update: should make PUT to /:id with body', () => {
    const updated: AnalysisRequestResponse = {
      ...sampleResponse,
      status: 'IN_PROGRESS' as any,
    };

    service
      .update(1, { ...sampleRequest, status: 'IN_PROGRESS' as any })
      .subscribe((res) => {
        expect(res.status).toBe('IN_PROGRESS');
      });

    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.status).toBe('IN_PROGRESS');
    req.flush(updated);
  });

  it('delete: should make DELETE to /:id', () => {
    service.delete(1).subscribe((res) => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('byPatient: should propagate HTTP error', () => {
    const status = 500;
    const statusText = 'Server Error';

    service.byPatient(99).subscribe({
      next: () => fail('Should fail'),
      error: (err) => {
        expect(err.status).toBe(status);
      },
    });

    const req = httpMock.expectOne(`${base}/patient/99`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'boom' }, { status, statusText });
  });
});
