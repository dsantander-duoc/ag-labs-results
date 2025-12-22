import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { LaboratoryService } from '../../services/laboratory/laboratory.service';
import { User } from '../../models/user.model';
import { LaboratoryResponse } from '../../models/laboratory.model';
import { Router } from '@angular/router';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  let snackSpy: jasmine.SpyObj<MatSnackBar>;
  let locationSpy: jasmine.SpyObj<Location>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let laboratoryServiceSpy: jasmine.SpyObj<LaboratoryService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
    userId: 1,
    rut: '12.345.678-9',
    username: 'jperez',
    name: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phone: '+56912345678',
    birthDate: '1990-01-15',
    address: 'Av. Principal 123',
    comunaId: 3,
    laboratoryId: 1,
    active: true,
    roleIds: [1],
  };

  const labs: LaboratoryResponse[] = [
    { id: 1, name: 'Lab Central' } as any,
    { id: 2, name: 'BioTest' } as any,
  ];

  beforeEach(async () => {
    snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    locationSpy = jasmine.createSpyObj('Location', ['back']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['update']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser']);
    laboratoryServiceSpy = jasmine.createSpyObj('LaboratoryService', [
      'getAll',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // defaults
    authServiceSpy.getUser.and.returnValue(mockUser as any);
    laboratoryServiceSpy.getAll.and.returnValue(of(labs));
    userServiceSpy.update.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, NoopAnimationsModule],
      providers: [
        { provide: Location, useValue: locationSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LaboratoryService, useValue: laboratoryServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // constructor + subscriptions
  });

  afterEach(fakeAsync(() => {
    flush();
  }));

  function getInputByFormControlName(name: string): HTMLInputElement {
    const de = fixture.debugElement.query(
      By.css(`input[formControlName="${name}"]`)
    );
    return de?.nativeElement as HTMLInputElement;
  }

  it('should create and build form with user from AuthService', () => {
    expect(component).toBeTruthy();
    expect(authServiceSpy.getUser).toHaveBeenCalled();

    expect(component.profileForm.get('username')?.value).toBe('jperez');
    expect(component.profileForm.get('name')?.value).toBe('Juan');
    expect(component.profileForm.get('lastName')?.value).toBe('Pérez');
    expect(component.profileForm.get('email')?.value).toBe(
      'juan.perez@example.com'
    );
  });

  it('should load laboratories on constructor', () => {
    expect(laboratoryServiceSpy.getAll).toHaveBeenCalled();
    expect(component.laboratories.length).toBe(2);
  });

  it('should render toolbar title', () => {
    const toolbar = fixture.debugElement.query(By.css('mat-toolbar'))
      ?.nativeElement as HTMLElement;
    expect(toolbar?.textContent || '').toContain('Mi Perfil');
  });

  it('goBack should call location.back', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should call goBack when clicking back button', () => {
    spyOn(component, 'goBack');

    const backBtn = fixture.debugElement.query(
      By.css('mat-toolbar button[aria-label="Volver"]')
    ).nativeElement as HTMLButtonElement;

    backBtn.click();

    expect(component.goBack).toHaveBeenCalled();
  });

  it('rut control should be disabled in the reactive form', () => {
    expect(component.profileForm.get('rut')?.disabled).toBeTrue();
  });

  it('typing in username input should update form control value', fakeAsync(() => {
    const el = getInputByFormControlName('username');
    expect(el).toBeTruthy();

    el.value = 'nuevoUsuario';
    el.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    expect(component.profileForm.get('username')?.value).toBe('nuevoUsuario');
    flush();
  }));

  it('onSave should not run when form is invalid', () => {
    component.profileForm.get('username')?.setValue('');
    expect(component.profileForm.invalid).toBeTrue();

    component.onSave();

    expect(userServiceSpy.update).not.toHaveBeenCalled();
    expect(snackSpy.open).not.toHaveBeenCalled();
  });

  it('onSave should not run when loading is true', () => {
    component.loading = true;

    component.onSave();

    expect(userServiceSpy.update).not.toHaveBeenCalled();
    expect(snackSpy.open).not.toHaveBeenCalled();
  });

  it('onSave should not run when userId is missing', () => {
    (component.profileData as any).userId = undefined;

    component.onSave();

    expect(userServiceSpy.update).not.toHaveBeenCalled();
    expect(snackSpy.open).not.toHaveBeenCalled();
  });

  it('should call onSave when submitting the form (ngSubmit)', fakeAsync(() => {
    spyOn(component, 'onSave').and.callThrough();

    const formDe = fixture.debugElement.query(By.css('form.profile-form'));
    expect(formDe).toBeTruthy();

    formDe.nativeElement.dispatchEvent(new Event('submit'));
    tick();
    fixture.detectChanges();

    expect(component.onSave).toHaveBeenCalled();
    flush();
  }));
});
