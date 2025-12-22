import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LaboratoryService } from './laboratory.service';
import { environment } from '../../../environments/environment';
import { LaboratoryResponse } from '../../models/laboratory.model';

describe('LaboratoryService', () => {
  let service: LaboratoryService;
  let httpMock: HttpTestingController;

  const base = `${environment.apiBaseUrlLabs}/labs`;

  const sampleLaboratories: LaboratoryResponse[] = [
    { id: 1, name: 'Lab Central', phone: '+56912345678' },
    { id: 2, name: 'BioTest', phone: '+56987654321' },
    { id: 3, name: 'Clínica Norte', phone: '+56911223344' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LaboratoryService],
    });
    service = TestBed.inject(LaboratoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll: should make GET request and return laboratories', () => {
    service.getAll().subscribe((res) => {
      expect(res).toEqual(sampleLaboratories);
      expect(res.length).toBe(3);
      expect(res[0].name).toBe('Lab Central');
    });

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush(sampleLaboratories);
  });

  it('getAll: should propagate HTTP error', () => {
    const status = 500;
    const statusText = 'Server Error';

    service.getAll().subscribe({
      next: () => fail('Should fail'),
      error: (err) => {
        expect(err.status).toBe(status);
      },
    });

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'Server error' }, { status, statusText });
  });

  it('getAll: should handle empty response', () => {
    service.getAll().subscribe((res) => {
      expect(res).toEqual([]);
      expect(res.length).toBe(0);
    });

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
