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
import { UpdateStaffRelationshipRequest } from 'app/shared/models/StaffRelationship';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-edit-relationship-modal',
  templateUrl: './edit-relationship-modal.component.html',
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
export class AdminEditRelationshipModalComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _router = inject(Router);
  private _staffRelationshipService = inject(StaffRelationshipService);

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
    public dialogRef: MatDialogRef<AdminEditRelationshipModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      currentStaffId: number;
      relationship: any;
      staffList: Staff[];
      relationshipTypes: OptionSelection[];
    },
    private _formBuilder: FormBuilder
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
        filter((event) => event instanceof NavigationStart),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        this.dialogRef.close(false);
      });

    // Pre-llenar el formulario con los datos recibidos del padre
    this.populateForm();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /** Pre-llena el formulario con los datos de la relación existente */
  private populateForm(): void {
    if (this.data.relationship) {
      const relationshipTypeId = this.data.relationship.relationshipTypeId ||
                                this.data.relationship.relationshipType?.id;
      const relatedStaffId = this.data.relationship.relatedStaffId ||
                            this.data.relationship.relatedStaff?.id;

      const relationshipType = this.listRelationshipTypes.find(type => type.id === relationshipTypeId);
      const relatedStaff = this.listStaff.find(staff => staff.id === relatedStaffId);

      if (relationshipType && relatedStaff) {
        this.form.setValue({
          relatedStaff: relatedStaff,
          relationshipType: relationshipType,
          comment: this.data.relationship.comment || ''
        });
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  /** Envía el formulario para actualizar la relación */
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;
    this._changeDetectorRef.markForCheck();

    const formValue = this.form.value;

    const updateRequest: UpdateStaffRelationshipRequest = {
      id: this.data.relationship.id,
      relationshipTypeId: formValue.relationshipType.id,
      comment: formValue.comment
    };

    this._staffRelationshipService.updateRelationship(updateRequest, {}).subscribe({
      next: () => {
        this._notificationService.showSuccessDialog('Relación actualizada exitosamente');
        this.dialogRef.close(true);
      },
      error: () => {
        this._notificationService.showErrorDialog('Error al actualizar la relación');
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  /** Cancela la operación y cierra el modal */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
