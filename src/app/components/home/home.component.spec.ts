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
import {
  AnalysisRequestResponse,
  AnalysisRequest,
  AnalysisRequestStatus,
} from '../../models/analysis.model';
import { LaboratoryService } from '../../services/laboratory/laboratory.service';
import { CreateAnalysisRequestDialogComponent } from './home.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('HomeComponent (shallow)', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let analysisServiceSpy: jasmine.SpyObj<AnalysisService>;
  let snackSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let laboratoryServiceSpy: jasmine.SpyObj<LaboratoryService>;

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
      'createRequest',
    ]);
    snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    laboratoryServiceSpy = jasmine.createSpyObj('LaboratoryService', [
      'getAll',
    ]);

    await TestBed.configureTestingModule({
      // Importamos el standalone component
      imports: [HomeComponent, NoopAnimationsModule],
      providers: [
        { provide: AnalysisService, useValue: analysisServiceSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LaboratoryService, useValue: laboratoryServiceSpy },
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

describe('CreateAnalysisRequestDialogComponent', () => {
  let component: CreateAnalysisRequestDialogComponent;
  let fixture: ComponentFixture<CreateAnalysisRequestDialogComponent>;

  let dialogRefSpy: jasmine.SpyObj<any>;
  let laboratoryServiceSpy: jasmine.SpyObj<LaboratoryService>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    laboratoryServiceSpy = jasmine.createSpyObj('LaboratoryService', [
      'getAll',
    ]);
    laboratoryServiceSpy.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [CreateAnalysisRequestDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: LaboratoryService, useValue: laboratoryServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAnalysisRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.requestForm).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.requestForm.get('status')?.value).toBe(
      AnalysisRequestStatus.PENDING
    );
    expect(component.requestForm.get('patientId')?.value).toBeNull();
    expect(component.requestForm.get('laboratoryId')?.value).toBeNull();
    expect(component.requestForm.get('doctorUserId')?.value).toBeNull();
  });

  it('should load laboratories in constructor', () => {
    // Component loads laboratories in constructor, spy is set up in beforeEach
    expect(laboratoryServiceSpy.getAll).toHaveBeenCalled();
  });

  it('onCancel should close dialog', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('onSave should not save when form invalid', () => {
    component.requestForm.reset();
    component.onSave();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('onSave should close dialog with form value when valid', fakeAsync(() => {
    component.requestForm.patchValue({
      patientId: 1,
      laboratoryId: 2,
      doctorUserId: 3,
      status: AnalysisRequestStatus.PENDING,
    });

    component.onSave();
    tick(300);

    expect(component.loading).toBeFalse();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(
      component.requestForm.value
    );
  }));

  it('onSave should not save when loading', () => {
    component.loading = true;
    component.requestForm.patchValue({
      patientId: 1,
      laboratoryId: 2,
      doctorUserId: 3,
      status: AnalysisRequestStatus.PENDING,
    });

    component.onSave();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });
});
