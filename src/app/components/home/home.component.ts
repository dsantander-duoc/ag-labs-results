import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort } from '@angular/material/sort';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  AnalysisRequestResponse,
  AnalysisRequest,
  AnalysisRequestStatus,
} from '../../models/analysis.model';
import { AnalysisService } from '../../services/analysis/analysis.service';
import { MatTabsModule } from '@angular/material/tabs';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { LaboratoryService } from '../../services/laboratory/laboratory.service';
import { LaboratoryResponse } from '../../models/laboratory.model';

type Mode = 'patient' | 'laboratory' | 'doctor';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSidenavModule,
    MatListModule,
    MatDialogModule,
    MatSelectModule,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  mode: Mode = 'patient';
  modes: Mode[] = ['patient', 'laboratory', 'doctor'];

  filterForm: FormGroup;

  displayedColumns = [
    'id',
    'patientRut',
    'laboratoryName',
    'doctorName',
    'requestStatus',
    'requestDate',
  ];
  dataSource = new MatTableDataSource<AnalysisRequestResponse>([]);
  loading = false;
  selectedRow?: AnalysisRequestResponse;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatSidenav;

  constructor(
    private analysisService: AnalysisService,
    private laboratoryService: LaboratoryService,
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      idValue: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {}

  onModeChange(mode: Mode) {
    this.mode = mode;
    this.dataSource.data = [];
    this.selectedRow = undefined;
    this.filterForm.reset();
  }

  search() {
    if (this.filterForm.invalid) return;
    const id = Number(this.filterForm.value.idValue);
    this.loading = true;
    console.log('search', this.mode, id, this.filterForm.value);
    try {
      let obs;
      if (this.mode === 'patient') obs = this.analysisService.byPatient(id);
      else if (this.mode === 'laboratory')
        obs = this.analysisService.byLaboratory(id);
      else obs = this.analysisService.byDoctor(id);

      obs.subscribe({
        next: (list: AnalysisRequestResponse[]) => {
          this.dataSource = new MatTableDataSource(list);
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        },
        error: (e: any) => {
          console.error(e);
          this.snack.open('Error al cargar datos', 'Cerrar', {
            duration: 3000,
          });
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
    } catch (error) {
      console.error(error);
      this.snack.open('Error al cargar datos', 'Cerrar', { duration: 3000 });
      this.loading = false;
    }
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
    this.drawer.close();
  }

  navigateToUserManagement() {
    this.router.navigate(['/user-management']);
    this.drawer.close();
  }

  toggleDrawer() {
    this.drawer.toggle();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openCreateRequestDialog(): void {
    const dialogRef = this.dialog.open(CreateAnalysisRequestDialogComponent, {
      width: '90%',
      maxWidth: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.analysisService.createRequest(result).subscribe({
          next: (response) => {
            this.loading = false;
            this.snack.open('Solicitud creada exitosamente', 'Cerrar', {
              duration: 3000,
            });
            if (this.filterForm.valid) {
              this.search();
            }
          },
          error: (error) => {
            this.loading = false;
            console.error('Error creating request:', error);
            this.snack.open('Error al crear solicitud', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
  }
}

// Create Analysis Request Dialog Component
@Component({
  selector: 'app-create-analysis-request-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon>add_circle</mat-icon>
      Nueva Solicitud de Análisis
    </h2>
    <mat-dialog-content>
      <form [formGroup]="requestForm" class="request-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Paciente</mat-label>
          <mat-select formControlName="patientId">
            <mat-option *ngFor="let patient of patients" [value]="patient.id">
              {{ patient.name }} ({{ patient.rut }})
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>person</mat-icon>
          <mat-error *ngIf="requestForm.get('patientId')?.hasError('required')">
            Selecciona un paciente
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Laboratorio</mat-label>
          <mat-select formControlName="laboratoryId">
            <mat-option *ngFor="let lab of laboratories" [value]="lab.id">
              {{ lab.name }}
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>science</mat-icon>
          <mat-error
            *ngIf="requestForm.get('laboratoryId')?.hasError('required')"
          >
            Selecciona un laboratorio
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Doctor</mat-label>
          <mat-select formControlName="doctorUserId">
            <mat-option *ngFor="let doctor of doctors" [value]="doctor.id">
              {{ doctor.name }} {{ doctor.lastName }}
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>medical_services</mat-icon>
          <mat-error
            *ngIf="requestForm.get('doctorUserId')?.hasError('required')"
          >
            Selecciona un doctor
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option [value]="AnalysisRequestStatus.PENDING">
              Pendiente
            </mat-option>
            <mat-option [value]="AnalysisRequestStatus.IN_PROGRESS">
              En Progreso
            </mat-option>
            <mat-option [value]="AnalysisRequestStatus.COMPLETED">
              Completado
            </mat-option>
            <mat-option [value]="AnalysisRequestStatus.CANCELLED">
              Cancelado
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>info</mat-icon>
          <mat-error *ngIf="requestForm.get('status')?.hasError('required')">
            Selecciona un estado
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSave()"
        [disabled]="requestForm.invalid || loading"
      >
        <mat-icon *ngIf="!loading">save</mat-icon>
        <mat-progress-spinner
          *ngIf="loading"
          diameter="20"
          mode="indeterminate"
        ></mat-progress-spinner>
        Crear Solicitud
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

      .request-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
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
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class CreateAnalysisRequestDialogComponent {
  requestForm: FormGroup;
  loading = false;
  AnalysisRequestStatus = AnalysisRequestStatus;

  // TODO: Get patients from service
  patients = [
    { id: 1, name: 'Elena', lastName: 'González', rut: '10.100.100-K' },
    { id: 2, name: 'Roberto', lastName: 'Soto', rut: '12.200.200-5' },
    { id: 3, name: 'Fernanda', lastName: 'Rojas', rut: '20.300.300-4' },
  ];

  laboratories: LaboratoryResponse[] = [];

  // TODO: Get doctors from service
  doctors = [
    { id: 1, name: 'Dr. Roberto', lastName: 'Sánchez' },
    { id: 2, name: 'Dra. Ana', lastName: 'Martínez' },
    { id: 3, name: 'Dr. Luis', lastName: 'Fernández' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateAnalysisRequestDialogComponent>,
    private laboratoryService: LaboratoryService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.requestForm = this.fb.group({
      patientId: [null, [Validators.required]],
      laboratoryId: [null, [Validators.required]],
      doctorUserId: [null, [Validators.required]],
      status: [AnalysisRequestStatus.PENDING, [Validators.required]],
    });
    this.laboratoryService.getAll().subscribe((laboratories) => {
      this.laboratories = laboratories;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.requestForm.invalid || this.loading) return;

    this.loading = true;
    // Simulate API call delay
    setTimeout(() => {
      this.loading = false;
      this.dialogRef.close(this.requestForm.value);
    }, 300);
  }
}
