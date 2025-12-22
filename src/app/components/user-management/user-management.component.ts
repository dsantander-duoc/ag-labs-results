import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = [
    'rut',
    'username',
    'name',
    'lastName',
    'email',
    'phone',
    'active',
    'actions',
  ];
  dataSource = new MatTableDataSource<User>([]);
  loading = false;
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Mock data for design purposes
  private mockUsers: User[] = [
    {
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
    },
    {
      userId: 2,
      rut: '98.765.432-1',
      username: 'mgarcia',
      name: 'María',
      lastName: 'García',
      email: 'maria.garcia@example.com',
      phone: '+56987654321',
      birthDate: '1985-05-20',
      address: 'Calle Secundaria 456',
      active: true,
      comunaId: 3,
      laboratoryId: 2,
      roleIds: [2],
    },
    {
      userId: 3,
      rut: '11.222.333-4',
      username: 'crodriguez',
      name: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@example.com',
      phone: '+56911223344',
      birthDate: '1992-08-10',
      address: 'Boulevard Norte 789',
      active: false,
      comunaId: 1,
      laboratoryId: 1,
      roleIds: [1, 2],
    },
  ];

  // Mock data for dropdowns
  comunas = [
    { id: 1, nombre: 'Arica' },
    { id: 2, nombre: 'Iquique' },
    { id: 3, nombre: 'Santiago' },
  ];

  laboratories = [
    { id: 1, nombre: 'Lab Central' },
    { id: 2, nombre: 'BioTest' },
    { id: 3, nombre: 'Clínica Norte' },
  ];

  roles = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Usuario' },
    { id: 3, nombre: 'Doctor' },
  ];

  constructor(
    private dialog: MatDialog,
    private location: Location,
    private snack: MatSnackBar,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.searchControl.valueChanges.subscribe((value) => {
      this.applyFilter(value || '');
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.loading = false;
      },
    });
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '90%',
      maxWidth: '600px',
      data: {
        comunas: this.comunas,
        laboratories: this.laboratories,
        roles: this.roles,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.create(result).subscribe({
          next: () => {
            this.snack.open('Usuario creado exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error creating user:', error);
            this.snack.open('Error al crear usuario', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '90%',
      maxWidth: '600px',
      data: {
        user: user,
        comunas: this.comunas,
        laboratories: this.laboratories,
        roles: this.roles,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.update(user.userId, result).subscribe({
          next: () => {
            this.snack.open('Usuario actualizado exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error updating user:', error);
            this.snack.open('Error al actualizar usuario', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  openDeleteDialog(user: User): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '90%',
      maxWidth: '400px',
      data: { user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.delete(user.userId).subscribe({
          next: () => {
            this.snack.open('Usuario eliminado exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error deleting user:', error);
            this.snack.open('Error al eliminar usuario', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  getRoleNames(roleIds: number[]): string {
    return roleIds
      .map((id) => this.roles.find((r) => r.id === id)?.nombre)
      .filter(Boolean)
      .join(', ');
  }
}

@Component({
  selector: 'app-user-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.user ? 'edit' : 'person_add' }}</mat-icon>
      {{ data.user ? 'Editar Usuario' : 'Nuevo Usuario' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>RUT</mat-label>
            <input
              matInput
              formControlName="rut"
              [readonly]="!!data.user"
              maxLength="12"
            />
            <mat-icon matPrefix>badge</mat-icon>
            <mat-error *ngIf="userForm.get('rut')?.hasError('required')">
              Campo obligatorio
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Usuario</mat-label>
            <input matInput formControlName="username" />
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="userForm.get('username')?.hasError('required')">
              Campo obligatorio
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Nombres</mat-label>
            <input matInput formControlName="name" />
            <mat-icon matPrefix>person_outline</mat-icon>
            <mat-error *ngIf="userForm.get('name')?.hasError('required')">
              Campo obligatorio
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Apellidos</mat-label>
            <input matInput formControlName="lastName" />
            <mat-icon matPrefix>person_outline</mat-icon>
            <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">
              Campo obligatorio
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Correo electrónico</mat-label>
            <input matInput type="email" formControlName="email" />
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">
              Campo obligatorio
            </mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">
              Correo inválido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="phone" />
            <mat-icon matPrefix>phone</mat-icon>
            <mat-error *ngIf="userForm.get('phone')?.hasError('required')">
              Campo obligatorio
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha de nacimiento</mat-label>
            <input
              matInput
              [matDatepicker]="picker"
              formControlName="birthDate"
            />
            <mat-datepicker-toggle
              matSuffix
              [for]="picker"
            ></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-icon matPrefix>calendar_today</mat-icon>
            <mat-error *ngIf="userForm.get('birthDate')?.hasError('required')">
              Campo obligatorio
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Comuna</mat-label>
            <mat-select formControlName="comunaId">
              <mat-option *ngFor="let c of data.comunas" [value]="c.id">
                {{ c.nombre }}
              </mat-option>
            </mat-select>
            <mat-icon matPrefix>location_city</mat-icon>
            <mat-error *ngIf="userForm.get('comunaId')?.hasError('required')">
              Selecciona una comuna
            </mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="address" />
          <mat-icon matPrefix>home</mat-icon>
          <mat-error *ngIf="userForm.get('address')?.hasError('required')">
            Campo obligatorio
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Laboratorio</mat-label>
          <mat-select formControlName="laboratoryId">
            <mat-option *ngFor="let l of data.laboratories" [value]="l.id">
              {{ l.nombre }}
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>science</mat-icon>
          <mat-error *ngIf="userForm.get('laboratoryId')?.hasError('required')">
            Selecciona un laboratorio
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Roles</mat-label>
          <mat-select formControlName="roleIds" multiple>
            <mat-option *ngFor="let r of data.roles" [value]="r.id">
              {{ r.nombre }}
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>admin_panel_settings</mat-icon>
          <mat-error *ngIf="userForm.get('roleIds')?.hasError('required')">
            Selecciona al menos un rol
          </mat-error>
        </mat-form-field>

        <div class="full-width" *ngIf="data.user">
          <mat-checkbox formControlName="active"> Usuario activo </mat-checkbox>
        </div>

        <div class="full-width" *ngIf="!data.user">
          <mat-form-field appearance="outline">
            <mat-label>Contraseña</mat-label>
            <input
              matInput
              [type]="hidePassword ? 'password' : 'text'"
              formControlName="password"
            />
            <button
              mat-icon-button
              matSuffix
              (click)="hidePassword = !hidePassword"
              type="button"
            >
              <mat-icon>{{
                hidePassword ? 'visibility_off' : 'visibility'
              }}</mat-icon>
            </button>
            <mat-icon matPrefix>lock</mat-icon>
            <mat-error *ngIf="userForm.get('password')?.hasError('required')">
              Campo obligatorio
            </mat-error>
            <mat-error *ngIf="userForm.get('password')?.hasError('pattern')">
              Mínimo 8 caracteres, una mayúscula y un número
            </mat-error>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSave()"
        [disabled]="userForm.invalid || loading"
      >
        <mat-icon *ngIf="!loading">{{ data.user ? 'save' : 'add' }}</mat-icon>
        <mat-progress-spinner
          *ngIf="loading"
          diameter="20"
          mode="indeterminate"
        ></mat-progress-spinner>
        {{ data.user ? 'Guardar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      h2[mat-dialog-title] {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        padding: 20px 24px 16px;
      }

      mat-dialog-content {
        padding: 0 24px;
        max-height: 70vh;
        overflow-y: auto;
      }

      .user-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }

      .form-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .full-width {
        width: 100%;
      }

      mat-form-field {
        width: 100%;
      }

      mat-dialog-actions {
        padding: 16px 24px 20px;
        margin: 0;
      }

      mat-dialog-actions button {
        min-width: 100px;
      }

      @media (max-width: 599.98px) {
        .form-row {
          grid-template-columns: 1fr;
        }

        mat-dialog-content {
          padding: 0 16px;
        }

        h2[mat-dialog-title] {
          padding: 16px 16px 12px;
        }

        mat-dialog-actions {
          padding: 12px 16px 16px;
        }
      }
    `,
  ],
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class UserDialogComponent {
  userForm: FormGroup;
  hidePassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      user?: User;
      comunas: any[];
      laboratories: any[];
      roles: any[];
    }
  ) {
    const user = data.user;
    this.userForm = this.fb.group({
      rut: [user?.rut || '', [Validators.required]],
      username: [user?.username || '', [Validators.required]],
      name: [user?.name || '', [Validators.required]],
      lastName: [user?.lastName || '', [Validators.required]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: [user?.phone || '', [Validators.required]],
      birthDate: [
        user?.birthDate ? new Date(user.birthDate) : null,
        [Validators.required],
      ],
      address: [user?.address || '', [Validators.required]],
      comunaId: [user?.comunaId || null, [Validators.required]],
      laboratoryId: [user?.laboratoryId || null, [Validators.required]],
      roleIds: [user?.roleIds || [], [Validators.required]],
      active: [user?.active ?? true],
      password: [
        '',
        user
          ? []
          : [
              Validators.required,
              Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/),
            ],
      ],
    });

    this.userForm.get('rut')?.valueChanges.subscribe((value: string) => {
      if (value) {
        if (value.length > 12) return;
        const formatted = this.formatRut(value);
        if (formatted !== value) {
          this.userForm.get('rut')?.setValue(formatted, { emitEvent: false });
        }
      }
    });
    this.userForm.get('birthDate')?.valueChanges.subscribe((value: Date) => {
      if (value) {
        if (value >= new Date()) {
          this.userForm.get('birthDate')?.setErrors({ invalidDate: true });
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.userForm.invalid || this.loading) return;

    this.loading = true;
    const formValue = this.userForm.value;

    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      const result = {
        ...formValue,
        birthDate: formValue.birthDate
          ? formValue.birthDate.toISOString()
          : null,
      };
      this.dialogRef.close(result);
    }, 500);
  }

  private formatRut(value: string): string {
    // Clean any invalid characters
    let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();

    if (clean.length <= 1) return clean;

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);

    let formatted = '';
    let count = 0;

    // Add the thousands separator
    for (let i = body.length - 1; i >= 0; i--) {
      formatted = body.charAt(i) + formatted;
      count++;
      if (count === 3 && i !== 0) {
        formatted = '.' + formatted;
        count = 0;
      }
    }

    return `${formatted}-${dv}`;
  }
}

@Component({
  selector: 'app-delete-confirm-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">warning</mat-icon>
      Confirmar eliminación
    </h2>
    <mat-dialog-content>
      <p>
        ¿Estás seguro de que deseas eliminar al usuario
        <strong>{{ data.user.name }} {{ data.user.lastName }}</strong>
        ({{ data.user.username }})?
      </p>
      <p class="warning-text">Esta acción no se puede deshacer.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">
        <mat-icon>delete</mat-icon>
        Eliminar
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      h2[mat-dialog-title] {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        padding: 20px 24px 16px;
      }

      mat-dialog-content {
        padding: 0 24px 16px;
      }

      mat-dialog-content p {
        margin: 0 0 12px 0;
      }

      .warning-text {
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }

      mat-dialog-actions {
        padding: 16px 24px 20px;
        margin: 0;
      }

      mat-dialog-actions button {
        min-width: 100px;
      }

      @media (max-width: 599.98px) {
        mat-dialog-content {
          padding: 0 16px 12px;
        }

        h2[mat-dialog-title] {
          padding: 16px 16px 12px;
        }

        mat-dialog-actions {
          padding: 12px 16px 16px;
        }
      }
    `,
  ],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, CommonModule],
})
export class DeleteConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
