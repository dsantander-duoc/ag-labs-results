import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AnalysisService } from '../../services/analysis/analysis.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AnalysisRequestResponse } from '../../models/analysis.model';

describe('HomeComponent (shallow)', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let analysisServiceSpy: jasmine.SpyObj<AnalysisService>;
  let snackSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const sampleList: AnalysisRequestResponse[] = [
    {
      analysisRequestId: 101 as any,
      patientRut: '12.345.678-9' as any,
      laboratoryName: 'Lab Central' as any,
      doctorName: 'Dra. Pérez' as any,
      requestStatus: 'PENDING' as any,
      requestDate: '2025-12-10T12:00:00Z' as any,
    } as unknown as AnalysisRequestResponse,
  ];

  beforeEach(async () => {
    analysisServiceSpy = jasmine.createSpyObj('AnalysisService', [
      'byPatient',
      'byLaboratory',
      'byDoctor',
      'delete',
    ]);
    snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      // Importamos el standalone component
      imports: [HomeComponent, NoopAnimationsModule],
      providers: [
        { provide: AnalysisService, useValue: analysisServiceSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    })
      // 🔑 Sobrescribimos el template para evitar montar MatTable en tests unitarios
      .overrideComponent(HomeComponent, {
        set: { template: '<div>shallow-home</div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.filterForm).toBeTruthy();
    expect(component.mode).toBe('patient');
  });

  it('onModeChange should reset table, selection and form', () => {
    component.selectedRow = sampleList[0];
    component.dataSource.data = sampleList;
    component.filterForm.setValue({ idValue: 123 });

    component.onModeChange('laboratory');

    expect(component.mode).toBe('laboratory');
    expect(component.dataSource.data.length).toBe(0);
    expect(component.selectedRow).toBeUndefined();
    expect(component.filterForm.value.idValue).toBeNull();
  });

  it('search (patient) should call byPatient and populate dataSource', fakeAsync(() => {
    component.mode = 'patient';
    component.filterForm.setValue({ idValue: 55 });
    analysisServiceSpy.byPatient.and.returnValue(of(sampleList));

    component.search();
    tick(); // por el setTimeout interno

    expect(analysisServiceSpy.byPatient).toHaveBeenCalledOnceWith(55);
    expect(component.dataSource.data).toEqual(sampleList);
    expect(component.loading).toBeFalse();
  }));

  it('search (laboratory) should call byLaboratory', fakeAsync(() => {
    component.mode = 'laboratory';
    component.filterForm.setValue({ idValue: 7 });
    analysisServiceSpy.byLaboratory.and.returnValue(of(sampleList));

    component.search();
    tick();

    expect(analysisServiceSpy.byLaboratory).toHaveBeenCalledOnceWith(7);
    expect(component.dataSource.data.length).toBe(1);
    expect(component.loading).toBeFalse();
  }));

  it('search (doctor) should call byDoctor', fakeAsync(() => {
    component.mode = 'doctor';
    component.filterForm.setValue({ idValue: 9 });
    analysisServiceSpy.byDoctor.and.returnValue(of(sampleList));

    component.search();
    tick();

    expect(analysisServiceSpy.byDoctor).toHaveBeenCalledOnceWith(9);
    expect(component.dataSource.data.length).toBe(1);
    expect(component.loading).toBeFalse();
  }));

  it('search should not call service when form invalid', () => {
    component.filterForm.reset({ idValue: null });

    component.search();

    expect(analysisServiceSpy.byPatient).not.toHaveBeenCalled();
    expect(analysisServiceSpy.byLaboratory).not.toHaveBeenCalled();
    expect(analysisServiceSpy.byDoctor).not.toHaveBeenCalled();
  });

  it('logout should call authService.logout and navigate to /login', () => {
    component.logout();
    expect(authSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
