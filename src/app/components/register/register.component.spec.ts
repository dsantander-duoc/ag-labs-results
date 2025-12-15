import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AbstractControl } from '@angular/forms';

describe('RegisterComponent (shallow)', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  let authSpy: jasmine.SpyObj<AuthService>;
  let snackSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['register']);
    snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, NoopAnimationsModule], // standalone
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        { provide: Router, useValue: routerSpy },
      ],
    })
      // Evitamos renderizar el template real (Material + datepicker) en unit tests
      .overrideComponent(RegisterComponent, {
        set: { template: '<div>shallow-register</div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and have a form', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeTruthy();
  });

  it('form invalid by default and requires basic fields', () => {
    const f = component.form;

    f.updateValueAndValidity();

    expect(f.valid).toBeFalse();

    f.get('email')?.setValue('not-an-email');
    f.get('email')?.updateValueAndValidity();
    expect(f.get('email')?.hasError('email')).toBeTrue();

    f.get('password')?.setValue('');
    f.get('password')?.updateValueAndValidity();
    expect(f.get('password')?.hasError('required')).toBeTrue();

    f.get('terms')?.setValue(false);
    f.get('terms')?.updateValueAndValidity();
    expect(f.get('terms')?.hasError('required')).toBeTrue();
  });

  it('should auto-format RUT on valueChanges', () => {
    const ctrl = component.form.get('rut')!;
    ctrl.setValue('203263589');
    expect(ctrl.value).toBe('20.326.358-9');
  });

  it('should validate password matching (mismatch shows error)', () => {
    const f = component.form;
    f.get('password')?.setValue('Abcd1234');
    f.get('confirmPassword')?.setValue('Different1');

    expect(f.get('confirmPassword')?.hasError('mismatch')).toBeTrue();

    f.get('confirmPassword')?.setValue('Abcd1234');
    expect(f.get('confirmPassword')?.hasError('mismatch')).toBeFalse();
  });

  it('should mark birthDate invalid if not in the past', () => {
    const birth = component.form.get('birthDate')!;
    const today = new Date();
    birth.setValue(today);
    expect(birth.hasError('invalidDate')).toBeTrue();

    const past = new Date(1990, 4, 20);
    birth.setValue(past);
    expect(birth.hasError('invalidDate')).toBeFalse();
  });

  it('onSubmit should not call register when form invalid or loading', () => {
    const spy = authSpy.register.and.returnValue(of(undefined));

    component.form.reset({
      email: 'a@a.com',
      password: 'Abcd1234',
      confirmPassword: 'Abcd1234',
      terms: true,
    });
    component.onSubmit();
    expect(spy).not.toHaveBeenCalled();

    component.loading = true;
    component.form.patchValue({
      rut: '20.326.358-9',
      name: 'Daniel',
      lastName: 'Santander',
      phone: '+56912345678',
      birthDate: new Date(1990, 4, 20),
      address: 'Av. Apoquindo',
      comunaId: 1,
      laboratoryId: 1,
      email: 'daniel@example.com',
      username: 'dsantander',
      password: 'Abcd1234',
      confirmPassword: 'Abcd1234',
      terms: true,
    });
    component.onSubmit();
    expect(spy).not.toHaveBeenCalled();

    component.loading = false;
  });

  it('navigateToLogin should navigate to /login', () => {
    component.navigateToLogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  const ctrl = (value: any) => ({ value } as unknown as AbstractControl);

  it('debe retornar null cuando el valor es null/undefined/empty', () => {
    expect(RegisterComponent.validPastDate(ctrl(null))).toBeNull();
    expect(RegisterComponent.validPastDate(ctrl(undefined))).toBeNull();
    expect(RegisterComponent.validPastDate(ctrl(''))).toBeNull();
  });

  it('debe marcar invalidDate cuando la fecha es inválida', () => {
    const res = RegisterComponent.validPastDate(ctrl('fecha-no-valida'));
    expect(res).toEqual({ invalidDate: true });
  });

  it('debe marcar invalidDate cuando la fecha es hoy', () => {
    // hoy (cualquier hora) se considera inválido según la regla (>= hoy)
    const today = new Date();
    const res = RegisterComponent.validPastDate(ctrl(today));
    expect(res).toEqual({ invalidDate: true });
  });

  it('debe marcar invalidDate cuando la fecha es futura', () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    const res = RegisterComponent.validPastDate(ctrl(future));
    expect(res).toEqual({ invalidDate: true });
  });

  it('debe retornar null cuando la fecha es en el pasado', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const res = RegisterComponent.validPastDate(ctrl(past));
    expect(res).toBeNull();
  });
});
