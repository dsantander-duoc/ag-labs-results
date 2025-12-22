import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/user.model';
import { LaboratoryResponse } from '../../models/laboratory.model';
import { LaboratoryService } from '../../services/laboratory/laboratory.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  profileForm: FormGroup;
  loading = false;

  // TODO: This should be fetched from the backend
  profileData = {
    name: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    rut: '12345678-9',
    username: 'jperez',
    phone: '+56912345678',
    birthDate: '1990-01-15',
    address: 'Av. Principal 123',
    comunaId: 3,
    laboratoryId: 1,
    active: true,
    roleIds: [1],
    userId: 1,
  } as User;

  // TODO: This should be fetched from the backend
  comunas = [
    { id: 1, nombre: 'Arica' },
    { id: 2, nombre: 'Iquique' },
    { id: 3, nombre: 'Santiago' },
  ];

  laboratories: LaboratoryResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private snack: MatSnackBar,
    private userService: UserService,
    private authService: AuthService,
    private laboratoryService: LaboratoryService
  ) {
    this.profileData = this.authService.getUser() as User;

    this.laboratoryService.getAll().subscribe((laboratories) => {
      this.laboratories = laboratories;
    });

    this.profileForm = this.fb.group({
      rut: [{ value: this.profileData.rut, disabled: true }],
      username: [this.profileData.username, [Validators.required]],
      name: [this.profileData.name, [Validators.required]],
      lastName: [this.profileData.lastName, [Validators.required]],
      email: [this.profileData.email, [Validators.required, Validators.email]],
      phone: [this.profileData.phone, [Validators.required]],
      birthDate: [this.profileData.birthDate, [Validators.required]],
      address: [this.profileData.address, [Validators.required]],
      comunaId: [this.profileData.comunaId, [Validators.required]],
      laboratoryId: [this.profileData.laboratoryId, [Validators.required]],
    });
  }

  goBack(): void {
    this.location.back();
  }

  onSave(): void {
    if (this.profileForm.invalid || this.loading || !this.profileData.userId)
      return;

    this.loading = true;

    this.userService
      .update(this.profileData.userId, this.profileForm.value)
      .subscribe({
        next: () => {
          this.loading = false;
          this.snack.open('Perfil actualizado correctamente', 'Cerrar', {
            duration: 3000,
          });
        },
        error: () => {
          this.loading = false;
          this.snack.open('Error al actualizar el perfil', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }
}
