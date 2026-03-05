import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { Staff } from 'app/shared/models/Staff';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { compareById } from 'app/shared/utils';
import { NotificationService } from 'app/shared/services/notification.service';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';
import { CreateStaffRelationshipRequest } from 'app/shared/models/StaffRelationship';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-add-relationship-modal',
  templateUrl: './add-relationship-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: fadeIn 1.0s ease-out;
    }
  `]
})
export class AddRelationshipModalComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _router = inject(Router);
  private _staffRelationshipService = inject(StaffRelationshipService);
  private _formBuilder = inject(FormBuilder);

  // Lists for selects
  listStaff: Staff[] = [];
  listRelationshipTypes: OptionSelection[] = [];

  // Current language
  currentLang: string = 'es';

  // Comparator for selects
  compareById = compareById;

  form: FormGroup = this._formBuilder.group({
    relatedStaff: new FormControl('', [Validators.required]),
    relationshipType: new FormControl('', [Validators.required]),
    comment: new FormControl('', [Validators.maxLength(500)]),
  });

  // Loading state for submit
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddRelationshipModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      currentStaffId: number;
      staffList: Staff[];
      relationshipTypes: OptionSelection[];
    },
  ) {}

  ngOnInit(): void {
    // Asignar datos recibidos del padre
    this.listStaff = this.data.staffList;
    this.listRelationshipTypes = this.data.relationshipTypes;

    // Obtener el idioma actual
    this.currentLang = this._translocoService.getActiveLang();

    // Suscribirse a cambios de idioma
    this._translocoService.langChanges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lang) => {
        this.currentLang = lang;
      });

    // Cerrar modal si hay navegación
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationStart),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /** Maneja el envío del formulario */
  onSubmit(): void {
    if (this.isLoading) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this._changeDetectorRef.markForCheck();

    const formValues = this.form.value;

    const request: CreateStaffRelationshipRequest = {
      staffId: this.data.currentStaffId,
      relatedStaffId: formValues.relatedStaff.id,
      relationshipTypeId: formValues.relationshipType.id,
      comment: formValues.comment || undefined,
    };

    this._staffRelationshipService.createRelationship(request, {}).subscribe({
      next: () => {
        this._notificationService.showSuccessDialog(this._translocoService.translate('staff.relationship.modal.success.createRelationship'));
        this.dialogRef.close({ success: true, data: request });
      },
      error: () => {
        this._notificationService.showErrorDialog(this._translocoService.translate('staff.relationship.modal.error.createRelationship'));
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      },
    });
  }

  /** Cancela la operación */
  onCancel(): void {
    this.dialogRef.close();
  }
}
