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

import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  let snackSpy: jasmine.SpyObj<MatSnackBar>;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, NoopAnimationsModule],
      providers: [
        { provide: Location, useValue: locationSpy },
        { provide: MatSnackBar, useValue: snackSpy },
      ],
    })
      // CLAVE: asegura que el componente use ESTE MatSnackBar (el spy)
      .overrideProvider(MatSnackBar, { useValue: snackSpy })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // CLAVE: limpia timers pendientes que Material suele dejar
  afterEach(fakeAsync(() => {
    flush();
  }));

  function getInputByFormControlName(name: string): HTMLInputElement {
    const de = fixture.debugElement.query(
      By.css(`input[formControlName="${name}"]`)
    );
    return de?.nativeElement as HTMLInputElement;
  }

  it('should create and build form with initial profileData', () => {
    expect(component).toBeTruthy();
    expect(component.profileForm).toBeTruthy();

    expect(component.profileForm.get('username')?.value).toBe(
      component.profileData.username
    );
    expect(component.profileForm.get('name')?.value).toBe(
      component.profileData.name
    );
    expect(component.profileForm.get('lastName')?.value).toBe(
      component.profileData.lastName
    );
    expect(component.profileForm.get('email')?.value).toBe(
      component.profileData.email
    );
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
    const rutControl = component.profileForm.get('rut');
    expect(rutControl).toBeTruthy();
    expect(rutControl?.disabled).toBeTrue();
  });

  it('should show header name and email from profileData', () => {
    const h2 = fixture.debugElement.query(By.css('.profile-header h2'))
      ?.nativeElement as HTMLElement;
    const subtitle = fixture.debugElement.query(
      By.css('.profile-header .subtitle')
    )?.nativeElement as HTMLElement;

    expect(h2?.textContent || '').toContain(component.profileData.name);
    expect(h2?.textContent || '').toContain(component.profileData.lastName);
    expect(subtitle?.textContent || '').toContain(component.profileData.email);
  });

  it('form should be invalid when required fields are empty (and show some mat-errors)', fakeAsync(() => {
    component.profileForm.get('username')?.setValue('');
    component.profileForm.get('name')?.setValue('');
    component.profileForm.get('lastName')?.setValue('');
    component.profileForm.get('email')?.setValue('');
    component.profileForm.get('phone')?.setValue('');
    component.profileForm.get('birthDate')?.setValue(null);
    component.profileForm.get('address')?.setValue('');
    component.profileForm.get('comunaId')?.setValue(null);
    component.profileForm.get('laboratoryId')?.setValue(null);

    Object.keys(component.profileForm.controls).forEach((k) => {
      component.profileForm.get(k)?.markAsTouched();
    });

    fixture.detectChanges();
    tick();

    expect(component.profileForm.invalid).toBeTrue();

    const errors = fixture.debugElement.queryAll(By.css('mat-error'));
    const allErrorText = errors
      .map((e) => (e.nativeElement.textContent as string).trim())
      .join(' | ');

    expect(allErrorText).toContain('Campo obligatorio');
    flush();
  }));

  it('email should show "Correo inválido" when format is invalid', fakeAsync(() => {
    component.profileForm.get('email')?.setValue('no-es-email');
    component.profileForm.get('email')?.markAsTouched();

    fixture.detectChanges();
    tick();

    const errors = fixture.debugElement.queryAll(By.css('mat-error'));
    const texts = errors.map((e) =>
      (e.nativeElement.textContent as string).trim()
    );

    expect(texts).toContain('Correo inválido');
    flush();
  }));

  it('onCancel should reset the form back to profileData', () => {
    component.profileForm.get('username')?.setValue('otroUser');
    component.profileForm.get('name')?.setValue('Otro');
    component.profileForm.get('email')?.setValue('otro@email.com');
    component.profileForm.get('address')?.setValue('Otra dirección');
    component.profileForm.get('comunaId')?.setValue(1);
    component.profileForm.get('laboratoryId')?.setValue(2);

    expect(component.profileForm.get('username')?.value).toBe('otroUser');

    component.onCancel();

    expect(component.profileForm.get('username')?.value).toBe(
      component.profileData.username
    );
    expect(component.profileForm.get('name')?.value).toBe(
      component.profileData.name
    );
    expect(component.profileForm.get('email')?.value).toBe(
      component.profileData.email
    );
    expect(component.profileForm.get('address')?.value).toBe(
      component.profileData.address
    );
    expect(component.profileForm.get('comunaId')?.value).toBe(
      component.profileData.comunaId
    );
    expect(component.profileForm.get('laboratoryId')?.value).toBe(
      component.profileData.laboratoryId
    );
  });

  it('should call onCancel when clicking Cancelar button', () => {
    spyOn(component, 'onCancel');

    const cancelBtn = fixture.debugElement
      .queryAll(By.css('button'))
      .find((b) =>
        ((b.nativeElement.textContent as string) || '').includes('Cancelar')
      )?.nativeElement as HTMLButtonElement;

    expect(cancelBtn).toBeTruthy();

    cancelBtn!.click();
    expect(component.onCancel).toHaveBeenCalled();
  });

  it('onSave should not run when form is invalid', () => {
    component.profileForm.get('username')?.setValue('');
    expect(component.profileForm.invalid).toBeTrue();

    component.onSave();

    expect(snackSpy.open).not.toHaveBeenCalled();
  });

  it('onSave should not run when loading is true', () => {
    component.loading = true;

    component.onSave();

    expect(snackSpy.open).not.toHaveBeenCalled();
  });

  it('onSave should open snack when form is valid', () => {
    // Asegura que está válido
    expect(component.profileForm.valid).toBeTrue();

    component.onSave();

    expect(snackSpy.open).toHaveBeenCalledWith(
      'Perfil actualizado correctamente',
      'Cerrar',
      jasmine.any(Object)
    );
  });

  it('should call onSave when submitting the form (ngSubmit)', fakeAsync(() => {
    spyOn(component, 'onSave').and.callThrough();

    const formDe = fixture.debugElement.query(By.css('form.profile-form'));
    expect(formDe).toBeTruthy();

    // submit real
    formDe.nativeElement.dispatchEvent(new Event('submit'));
    tick();
    fixture.detectChanges();

    expect(component.onSave).toHaveBeenCalled();
    flush();
  }));

  it('save button should be disabled when form is invalid', fakeAsync(() => {
    component.profileForm.get('username')?.setValue('');
    fixture.detectChanges();
    tick();

    const saveBtn = fixture.debugElement
      .queryAll(By.css('button'))
      .find((b) =>
        ((b.nativeElement.textContent as string) || '').includes(
          'Guardar cambios'
        )
      )?.nativeElement as HTMLButtonElement;

    expect(saveBtn).toBeTruthy();
    expect(saveBtn!.disabled).toBeTrue();
    flush();
  }));

  it('save button should be disabled when loading is true', fakeAsync(() => {
    component.loading = true;
    fixture.detectChanges();
    tick();

    const saveBtn = fixture.debugElement
      .queryAll(By.css('button'))
      .find((b) =>
        ((b.nativeElement.textContent as string) || '').includes(
          'Guardar cambios'
        )
      )?.nativeElement as HTMLButtonElement;

    expect(saveBtn).toBeTruthy();
    expect(saveBtn!.disabled).toBeTrue();
    flush();
  }));

  it('should show spinner in save button when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(
      By.css('button mat-progress-spinner')
    );
    expect(spinner).toBeTruthy();
  });

  it('should hide spinner in save button when loading is false', () => {
    component.loading = false;
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(
      By.css('button mat-progress-spinner')
    );
    expect(spinner).toBeNull();
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
});
