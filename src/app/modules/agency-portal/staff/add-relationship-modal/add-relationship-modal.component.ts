import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { StaffService } from 'app/shared/services/staff.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { Staff } from 'app/shared/models/Staff';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { isNullOrUndefinedEmptyStringNullArray, compareById } from 'app/shared/utils';
import { NotificationService } from 'app/shared/services/notification.service';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';
import { CreateStaffRelationshipRequest } from 'app/shared/models/StaffRelationship';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';

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
    TranslocoModule,
  ],
})
export class AddRelationshipModalComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _router = inject(Router);
  private _staffService = inject(StaffService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _staffRelationshipService = inject(StaffRelationshipService);
  private _authService = inject(AuthService);
  private _formBuilder = inject(FormBuilder);

  // Lists for selects
  listStaff: Staff[] = [];
  listRelationshipTypes: OptionSelection[] = [];

  // Comparator for selects
  compareById = compareById;

  form: FormGroup = this._formBuilder.group({
    relatedStaff: new FormControl('', [Validators.required]),
    relationshipType: new FormControl('', [Validators.required]),
  });

  // Loading
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddRelationshipModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentStaffId: number },
  ) {}

  ngOnInit(): void {

    this.onLoadInitialData();

    // Suscribirse a cambios de navegación para cerrar el modal automáticamente
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

  onLoadInitialData(): void {

    const agencyId = this._authService.getAgencyId();

    const staffQueryParams: QueryParameters = {
      take: 25,
      skip: 0,
      name: null,
      alls: false,
      excludeRelated: true,
      isList: false,
      staffTypeId: 2,
      agencyId: agencyId,
    };

    const relationshipQueryParams: QueryParameters = {
      optionKey: 'staffRelationshipType',
      names: null,
    };

    // Ejecutar ambas requests en paralelo usando forkJoin
    forkJoin({
      staff: this._staffService.getAllStaffFromDb(staffQueryParams),
      relationshipTypes: this._optionSelectionService.getOptionSelectionByOptionKey(relationshipQueryParams)
    }).subscribe({
      next: (response) => {
        // Procesar respuesta de staff
        if (!isNullOrUndefinedEmptyStringNullArray(response.staff)) {
          // Filtrar el usuario actual para evitar auto-relaciones
          this.listStaff = response.staff.body.data;
        }

        // Procesar respuesta de relationship types
        if (!isNullOrUndefinedEmptyStringNullArray(response.relationshipTypes)) {
          this.listRelationshipTypes = response.relationshipTypes.body.data;
        }

        this._changeDetectorRef.detectChanges();
      },
      error: (error) => {
        this._notificationService.showErrorDialog(this._translocoService.translate('staff.relationship.modal.error.loadingData'));
      },
      complete: () => {
      }
    });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formValues = this.form.value;
    const currentStaff = formValues.relatedStaff;
    const relationshipType = formValues.relationshipType;

    const request: CreateStaffRelationshipRequest = {
      staffId: this.data.currentStaffId,
      relatedStaffId: currentStaff.id,
      relationshipTypeId: relationshipType.id,
    };

    this._staffRelationshipService.createRelationship(request, {}).subscribe({
      next: (response) => {
        this._notificationService.showSuccessDialog(this._translocoService.translate('staff.relationship.modal.success.createRelationship'));
      },
      error: (error) => {
        this._notificationService.showErrorDialog(this._translocoService.translate('staff.relationship.modal.error.createRelationship'));
      },
      complete: () => {
        this.isLoading = false;
        this.dialogRef.close({ success: true, data: request });
      }
    });
  }

  /**
   * Cancela la operación
   */
  onCancel(): void {
    this.dialogRef.close();
  }

}
