import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  flushMicrotasks,
  tick,
} from '@angular/core/testing';
import {
  DeleteConfirmDialogComponent,
  UserDialogComponent,
  UserManagementComponent,
} from './user-management.component';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { User } from '../../models/user.model';
import { of, throwError } from 'rxjs';
import { UserService } from '../../services/user/user.service';
import { FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;

  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let snackSpy: jasmine.SpyObj<MatSnackBar>;
  let locationSpy: jasmine.SpyObj<Location>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  function dialogRefWithResult<T>(result: T) {
    const ref = jasmine.createSpyObj<MatDialogRef<any>>('MatDialogRef', [
      'afterClosed',
    ]);
    ref.afterClosed.and.returnValue(of(result));
    return ref;
  }

  const sampleUser: User = {
    userId: 1,
    rut: '12.345.678-9',
    username: 'jperez',
    name: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phone: '+56912345678',
    birthDate: '1990-01-15',
    address: 'Av. Principal 123',
    active: true,
    comunaId: 3,
    laboratoryId: 1,
    roleIds: [1],
  };

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    locationSpy = jasmine.createSpyObj('Location', ['back', 'subscribe']);
    locationSpy.subscribe.and.returnValue({ unsubscribe: () => {} } as any);

    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getAll',
      'delete',
      'create',
      'update',
    ]);

    userServiceSpy.getAll.and.returnValue(of([]));
    userServiceSpy.delete.and.returnValue(of(void 0));
    userServiceSpy.create.and.returnValue(of({} as User));
    userServiceSpy.update.and.returnValue(of({} as User));

    dialogSpy.open.and.returnValue(dialogRefWithResult(null) as any);

    await TestBed.configureTestingModule({
      imports: [UserManagementComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        { provide: Location, useValue: locationSpy },
        { provide: UserService, useValue: userServiceSpy },
        FormBuilder,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    })
      .overrideProvider(MatDialog, { useValue: dialogSpy })
      .overrideProvider(MatSnackBar, { useValue: snackSpy })
      .overrideProvider(Location, { useValue: locationSpy })
      .overrideProvider(UserService, { useValue: userServiceSpy })
      .compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    component.ngAfterViewInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.dataSource).toBeTruthy();
    expect(component.searchControl).toBeTruthy();
  });

  it('should initialize with empty data source', () => {
    expect(component.dataSource.data.length).toBe(0);
    expect(component.loading).toBeFalse();
  });

  it('loadUsers should load users from service', fakeAsync(() => {
    const users = [sampleUser];
    userServiceSpy.getAll.and.returnValue(of(users));

    component.loadUsers();
    flushMicrotasks();
    fixture.detectChanges();

    expect(userServiceSpy.getAll).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(users);
    expect(component.loading).toBeFalse();
  }));

  it('loadUsers should handle error', fakeAsync(() => {
    userServiceSpy.getAll.and.returnValue(throwError(() => new Error('Error')));
    spyOn(console, 'error');

    component.loadUsers();
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.dataSource.data.length).toBe(0);
  }));

  it('applyFilter should filter data source', () => {
    component.dataSource.data = [sampleUser];
    component.applyFilter('juan');
    expect(component.dataSource.filter).toBe('juan');
  });

  it('applyFilter should reset paginator to first page', () => {
    component.ngAfterViewInit();
    spyOn(component.paginator, 'firstPage');

    component.applyFilter('test');

    expect(component.dataSource.filter).toBe('test');
    expect(component.paginator.firstPage).toHaveBeenCalled();
  });

  it('openCreateDialog should open dialog', () => {
    dialogSpy.open.and.returnValue(dialogRefWithResult(null) as any);
    component.openCreateDialog();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('openEditDialog should open dialog', () => {
    dialogSpy.open.and.returnValue(dialogRefWithResult(null) as any);
    component.openEditDialog(sampleUser);
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('openDeleteDialog should open dialog', () => {
    dialogSpy.open.and.returnValue(dialogRefWithResult(null) as any);
    component.openDeleteDialog(sampleUser);
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('openCreateDialog should create user, show success snack and reload users', fakeAsync(() => {
    const newUser = { ...sampleUser, userId: 0 };

    dialogSpy.open.and.returnValue(dialogRefWithResult(newUser) as any);
    userServiceSpy.create.and.returnValue(of(newUser as any));

    const loadUsersSpy = spyOn(component, 'loadUsers');

    component.openCreateDialog();
    flushMicrotasks();
    fixture.detectChanges();

    expect(userServiceSpy.create).toHaveBeenCalledWith(newUser);
    expect(snackSpy.open).toHaveBeenCalledWith(
      'Usuario creado exitosamente',
      'Cerrar',
      jasmine.any(Object)
    );
    expect(loadUsersSpy).toHaveBeenCalled();
  }));

  it('openCreateDialog should show error snack when create fails', fakeAsync(() => {
    const newUser = { ...sampleUser, userId: 0 };

    dialogSpy.open.and.returnValue(dialogRefWithResult(newUser) as any);
    userServiceSpy.create.and.returnValue(throwError(() => new Error('fail')));

    spyOn(console, 'error');

    component.openCreateDialog();
    flushMicrotasks();
    fixture.detectChanges();

    expect(userServiceSpy.create).toHaveBeenCalledWith(newUser);
    expect(snackSpy.open).toHaveBeenCalledWith(
      'Error al crear usuario',
      'Cerrar',
      jasmine.any(Object)
    );
  }));

  it('openCreateDialog should not call create when dialog result is null', fakeAsync(() => {
    dialogSpy.open.and.returnValue(dialogRefWithResult(null) as any);

    component.openCreateDialog();
    flushMicrotasks();

    expect(userServiceSpy.create).not.toHaveBeenCalled();
    expect(snackSpy.open).not.toHaveBeenCalled();
  }));

  it('openEditDialog should update user, show success snack and reload users', fakeAsync(() => {
    const payload = { ...sampleUser, name: 'Juanito' };

    dialogSpy.open.and.returnValue(dialogRefWithResult(payload) as any);
    userServiceSpy.update.and.returnValue(of(payload as any));

    const loadUsersSpy = spyOn(component, 'loadUsers');

    component.openEditDialog(sampleUser);
    flushMicrotasks();
    fixture.detectChanges();

    expect(userServiceSpy.update).toHaveBeenCalledWith(
      sampleUser.userId,
      payload
    );
    expect(snackSpy.open).toHaveBeenCalledWith(
      'Usuario actualizado exitosamente',
      'Cerrar',
      jasmine.any(Object)
    );
    expect(loadUsersSpy).toHaveBeenCalled();
  }));

  it('openEditDialog should show error snack when update fails', fakeAsync(() => {
    const payload = { ...sampleUser, name: 'Juanito' };

    dialogSpy.open.and.returnValue(dialogRefWithResult(payload) as any);
    userServiceSpy.update.and.returnValue(throwError(() => new Error('fail')));

    spyOn(console, 'error');

    component.openEditDialog(sampleUser);
    flushMicrotasks();
    fixture.detectChanges();

    expect(userServiceSpy.update).toHaveBeenCalledWith(
      sampleUser.userId,
      payload
    );
    expect(snackSpy.open).toHaveBeenCalledWith(
      'Error al actualizar usuario',
      'Cerrar',
      jasmine.any(Object)
    );
  }));

  it('openDeleteDialog should delete user, show success snack and reload users', fakeAsync(() => {
    dialogSpy.open.and.returnValue(dialogRefWithResult(true) as any);
    userServiceSpy.delete.and.returnValue(of(void 0));

    const loadUsersSpy = spyOn(component, 'loadUsers');

    component.openDeleteDialog(sampleUser);
    flushMicrotasks();
    fixture.detectChanges();

    expect(userServiceSpy.delete).toHaveBeenCalledWith(sampleUser.userId);
    expect(snackSpy.open).toHaveBeenCalledWith(
      'Usuario eliminado exitosamente',
      'Cerrar',
      jasmine.any(Object)
    );
    expect(loadUsersSpy).toHaveBeenCalled();
  }));

  it('openDeleteDialog should show error snack when delete fails', fakeAsync(() => {
    dialogSpy.open.and.returnValue(dialogRefWithResult(true) as any);
    userServiceSpy.delete.and.returnValue(throwError(() => new Error('fail')));

    spyOn(console, 'error');

    component.openDeleteDialog(sampleUser);
    flushMicrotasks();
    fixture.detectChanges();

    expect(userServiceSpy.delete).toHaveBeenCalledWith(sampleUser.userId);
    expect(snackSpy.open).toHaveBeenCalledWith(
      'Error al eliminar usuario',
      'Cerrar',
      jasmine.any(Object)
    );
  }));

  it('openDeleteDialog should not call delete when cancelled', fakeAsync(() => {
    dialogSpy.open.and.returnValue(dialogRefWithResult(false) as any);

    component.openDeleteDialog(sampleUser);
    flushMicrotasks();

    expect(userServiceSpy.delete).not.toHaveBeenCalled();
    expect(snackSpy.open).not.toHaveBeenCalled();
  }));

  it('ngAfterViewInit should assign paginator and sort to dataSource', () => {
    component.ngAfterViewInit();
    expect(component.dataSource.paginator).toBe(component.paginator);
    expect(component.dataSource.sort).toBe(component.sort);
  });

  it('should render toolbar title', () => {
    const toolbar = fixture.debugElement.query(By.css('mat-toolbar'))
      .nativeElement as HTMLElement;
    expect(toolbar.textContent || '').toContain('Gestión de Usuarios');
  });

  it('should call goBack when clicking back button', () => {
    spyOn(component, 'goBack');

    const backBtn = fixture.debugElement.query(By.css('mat-toolbar button'))
      .nativeElement as HTMLButtonElement;

    backBtn.click();

    expect(component.goBack).toHaveBeenCalled();
  });

  it('should call openCreateDialog when clicking "Nuevo Usuario"', () => {
    spyOn(component, 'openCreateDialog');

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const createBtn = buttons.find((b) =>
      ((b.nativeElement.textContent as string) || '').includes('Nuevo Usuario')
    )!.nativeElement as HTMLButtonElement;

    createBtn.click();

    expect(component.openCreateDialog).toHaveBeenCalled();
  });

  it('should update searchControl when typing in search input', () => {
    const inputDe = fixture.debugElement.query(By.css('input[matInput]'));
    const inputEl = inputDe.nativeElement as HTMLInputElement;

    inputEl.value = 'juan';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.searchControl.value).toBe('juan');
  });
});

describe('UserDialogComponent', () => {
  let fixture: ComponentFixture<UserDialogComponent>;
  let component: UserDialogComponent;

  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<UserDialogComponent>>;

  const comunas = [{ id: 1, nombre: 'Arica' }];
  const laboratories = [{ id: 1, nombre: 'Lab Central' }];
  const roles = [{ id: 1, nombre: 'Administrador' }];

  function createComponent(data: any) {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [UserDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });

    fixture = TestBed.createComponent(UserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create in "create mode" (no user) and require password with pattern', () => {
    createComponent({ comunas, laboratories, roles });

    expect(component).toBeTruthy();
    expect(component.hidePassword).toBeTrue();
    expect(component.loading).toBeFalse();

    // En modo "nuevo usuario", password es requerido
    const passwordCtrl = component.userForm.get('password');
    expect(passwordCtrl).toBeTruthy();

    passwordCtrl!.setValue('');
    expect(passwordCtrl!.hasError('required')).toBeTrue();

    passwordCtrl!.setValue('abc'); // inválida por patrón
    expect(passwordCtrl!.hasError('pattern')).toBeTrue();

    passwordCtrl!.setValue('Abcdefg1'); // válida (>=8, mayúscula, número)
    expect(passwordCtrl!.valid).toBeTrue();
  });

  it('should create in "edit mode" (with user) and password should NOT be required', () => {
    const user: User = {
      userId: 10,
      rut: '12.345.678-9',
      username: 'jperez',
      name: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      phone: '+56912345678',
      birthDate: '1990-01-15',
      address: 'Av. Principal 123',
      active: false,
      comunaId: 1,
      laboratoryId: 1,
      roleIds: [1],
    };

    createComponent({ user, comunas, laboratories, roles });

    expect(component.userForm.get('rut')?.value).toBe(user.rut);
    expect(component.userForm.get('active')?.value).toBeFalse();

    // birthDate se mapea a Date
    const bd = component.userForm.get('birthDate')?.value as Date;
    expect(bd instanceof Date).toBeTrue();

    // En edición, password NO requerido
    const passwordCtrl = component.userForm.get('password');
    passwordCtrl!.setValue('');
    expect(passwordCtrl!.valid).toBeTrue();
  });

  it('onCancel should close dialog without payload', () => {
    createComponent({ comunas, laboratories, roles });

    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('onSave should return early if form is invalid', fakeAsync(() => {
    createComponent({ comunas, laboratories, roles });

    // Deja el form inválido a propósito (faltan campos requeridos)
    component.onSave();
    tick(600);

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
    flush();
  }));

  it('onSave should return early if loading is true', fakeAsync(() => {
    createComponent({ comunas, laboratories, roles });

    component.loading = true;
    component.onSave();
    tick(600);

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
    flush();
  }));

  it('onSave should close dialog with mapped result and birthDate ISO when valid (create mode)', fakeAsync(() => {
    createComponent({ comunas, laboratories, roles });

    // Completa el form para que sea válido (incluye password)
    component.userForm.patchValue({
      rut: '11.222.333-4',
      username: 'mgarcia',
      name: 'María',
      lastName: 'García',
      email: 'maria.garcia@example.com',
      phone: '+56911111111',
      birthDate: new Date('2000-01-02T00:00:00.000Z'),
      address: 'Calle 123',
      comunaId: 1,
      laboratoryId: 1,
      roleIds: [1],
      active: true,
      password: 'Abcdefg1',
    });

    expect(component.userForm.valid).toBeTrue();

    component.onSave();

    // loading se prende al inicio
    expect(component.loading).toBeTrue();

    // espera el setTimeout(500)
    tick(500);
    fixture.detectChanges();

    expect(component.loading).toBeFalse();

    // Asegura que birthDate se serializa a ISO
    expect(dialogRefSpy.close).toHaveBeenCalled();
    const payload = dialogRefSpy.close.calls.mostRecent().args[0];

    expect(payload.username).toBe('mgarcia');
    expect(typeof payload.birthDate).toBe('string');
    expect(payload.birthDate).toContain('2000-01-02');
    flush();
  }));

  it('onSave should close dialog with birthDate null if it is null', fakeAsync(() => {
    createComponent({ comunas, laboratories, roles });

    component.userForm.patchValue({
      rut: '11.222.333-4',
      username: 'mgarcia',
      name: 'María',
      lastName: 'García',
      email: 'maria.garcia@example.com',
      phone: '+56911111111',
      birthDate: null, // invalid por required, así que quitamos required para testear rama null
      address: 'Calle 123',
      comunaId: 1,
      laboratoryId: 1,
      roleIds: [1],
      active: true,
      password: 'Abcdefg1',
    });

    // Forzamos la rama "birthDate null" quitando el required solo para este test
    component.userForm.get('birthDate')?.clearValidators();
    component.userForm.get('birthDate')?.updateValueAndValidity();

    expect(component.userForm.valid).toBeTrue();

    component.onSave();
    tick(500);

    const payload = dialogRefSpy.close.calls.mostRecent().args[0];
    expect(payload.birthDate).toBeNull();
    flush();
  }));
});

describe('DeleteConfirmDialogComponent', () => {
  let fixture: ComponentFixture<DeleteConfirmDialogComponent>;
  let component: DeleteConfirmDialogComponent;

  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DeleteConfirmDialogComponent>>;

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    const user: User = {
      userId: 1,
      rut: '12.345.678-9',
      username: 'jperez',
      name: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      phone: '+56912345678',
      birthDate: '1990-01-15',
      address: 'Av. Principal 123',
      active: true,
      comunaId: 1,
      laboratoryId: 1,
      roleIds: [1],
    };

    TestBed.configureTestingModule({
      imports: [DeleteConfirmDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { user } },
      ],
    });

    fixture = TestBed.createComponent(DeleteConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.data.user).toBeTruthy();
  });

  it('onCancel should close dialog without payload', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('onConfirm should close dialog with true', () => {
    component.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });
});
