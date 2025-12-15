import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ConfirmDialogComponent } from '../../shared/dialog/confirm-dialog/confirm-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort } from '@angular/material/sort';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AnalysisRequestResponse } from '../../models/analysis.model';
import { AnalysisService } from '../../services/analysis/analysis.service';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

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
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTabsModule,
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

  constructor(
    private analysisService: AnalysisService,
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router
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
        next: (list) => {
          this.dataSource = new MatTableDataSource(list);
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        },
        error: (e) => {
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
