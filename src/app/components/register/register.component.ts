import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterDTO } from '../../models/user.model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  hidePass = true;
  hideConfirm = true;
  loading = false;

  // TODO: This should be fetched from the backend
  comunas = [
    { id: 1, nombre: 'Arica' },
    { id: 2, nombre: 'Iquique' },
    { id: 3, nombre: 'Santiago' },
  ];
  // TODO: This should be fetched from the backend
  labs = [
    { id: 1, nombre: 'Lab Central' },
    { id: 2, nombre: 'BioTest' },
    { id: 3, nombre: 'Clínica Norte' },
  ];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group(
      {
        rut: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(\d{1,2}\.?\d{3}\.?\d{3}\-?[\dkK])$/),
          ],
        ],
        name: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        birthDate: [null as any, [Validators.required]],
        address: ['', [Validators.required]],
        comunaId: [null as any, [Validators.required]],
        laboratoryId: [null as any, [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required]],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        terms: [false, [Validators.requiredTrue]],
      },
      {
        validators: [
          RegisterComponent.matchPassword('password', 'confirmPassword'),
        ],
      }
    );

    this.form.get('rut')?.valueChanges.subscribe((value) => {
      if (value) {
        if (value.length > 12) return;
        const formatted = this.formatRut(value);
        if (formatted !== value) {
          this.form.get('rut')?.setValue(formatted, { emitEvent: false });
        }
      }
    });
    this.form.get('birthDate')?.valueChanges.subscribe((value) => {
      if (value) {
        if (value >= new Date()) {
          this.form.get('birthDate')?.setErrors({ invalidDate: true });
        }
      }
    });
  }

  static validPastDate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(date.getTime()) || date >= today) {
      return { invalidDate: true };
    }
    return null;
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
  static matchPassword(passKey: string, confirmKey: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const pass = group.get(passKey);
      const confirm = group.get(confirmKey);
      if (!pass || !confirm) return null;
      const mismatch = pass.value !== confirm.value;
      if (mismatch)
        confirm.setErrors({ ...(confirm.errors || {}), mismatch: true });
      else if (confirm.hasError('mismatch')) {
        const { mismatch, ...rest } = confirm.errors || {};
        confirm.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    };
  }

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;

    const v = this.form.value;
    const dto: RegisterDTO = {
      rut: v.rut!,
      name: v.name!,
      lastName: v.lastName!,
      phone: v.phone!,
      birthDate: (v.birthDate as Date).toISOString(),
      address: v.address!,
      comunaId: v.comunaId!,
      laboratoryId: v.laboratoryId!,
      email: v.email!,
      username: v.username!,
      password: v.password!,
      roleIds: [1],
      active: true,
    };

    this.authService.register(dto).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Cuenta creada con éxito', 'OK', { duration: 2500 });
        setTimeout(() => {
          this.navigateToLogin();
        }, 1500);
      },
      error: () => {
        this.loading = false;
        this.snack.open('Error al crear la cuenta', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
