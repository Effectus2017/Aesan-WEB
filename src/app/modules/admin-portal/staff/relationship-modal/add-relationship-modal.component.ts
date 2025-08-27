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
import { Subject, takeUntil } from 'rxjs';
import { StaffService } from 'app/shared/services/staff.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { Staff } from 'app/shared/models/Staff';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { isNullOrUndefinedEmptyStringNullArray, compareById } from 'app/shared/utils';
import { FuseLoadingService } from '@fuse/services/loading';
import { CreateStaffRelationshipRequest } from 'app/shared/models/StaffRelationship';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-add-relationship-modal',
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
export class AdminAddRelationshipModalComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _fuseLoadingService = inject(FuseLoadingService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _router = inject(Router);
  private _staffService = inject(StaffService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _staffRelationshipService = inject(StaffRelationshipService);

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
    public dialogRef: MatDialogRef<AdminAddRelationshipModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentStaffId: number },
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    // Deshabilitar el auto mode del loading service para evitar ExpressionChangedAfterItHasBeenCheckedError
    this._fuseLoadingService.setAutoMode(false);

    this.loadStaffList();
    this.loadRelationshipTypes();

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
    // Restaurar el auto mode del loading service
    this._fuseLoadingService.setAutoMode(true);

    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Carga la lista de staff disponible
   */
  private loadStaffList(): void {

    const queryParams: QueryParameters = {
      take: 25,
      skip: 0,
      name: null,
      alls: true,
      isList: true,
      staffTypeId: 2,
    };

    this._staffService.getAllStaffFromDb(queryParams).subscribe({
      next: (response) => {
        if (!isNullOrUndefinedEmptyStringNullArray(response?.body?.data)) {
          // Filtrar el staff actual para evitar auto-relación
          this.listStaff = response.body.data.filter((staff: Staff) => staff.id !== this.data.currentStaffId);
          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading staff list:', error);
        this._notificationService.showError(this._translocoService.translate('staff.relationship.error.loadStaff'));
      }
    });
  }

  /**
   * Carga los tipos de relación disponibles
   */
  private loadRelationshipTypes(): void {
    const queryParams: QueryParameters = {
      optionKey: 'relationshipType',
      names: null,
    };

    this._optionSelectionService.getOptionSelectionByOptionKey(queryParams).subscribe({
      next: (response) => {
        if (!isNullOrUndefinedEmptyStringNullArray(response?.body?.data)) {
          this.listRelationshipTypes = response.body.data;
          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading relationship types:', error);
        this._notificationService.showError(this._translocoService.translate('staff.relationship.error.loadTypes'));
      }
    });
  }

  /**
   * Envía el formulario para crear la relación
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this._fuseLoadingService.show();

    const formValues = this.form.value;

    const request: CreateStaffRelationshipRequest = {
      staffId: this.data.currentStaffId,
      relatedStaffId: formValues.relatedStaff.id,
      relationshipTypeId: formValues.relationshipType.id,
    };

    this._staffRelationshipService.createRelationship(request, null).subscribe({
      next: (response) => {
        this._notificationService.showSuccess(this._translocoService.translate('staff.relationship.success.created'));
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error creating relationship:', error);
        this._notificationService.showError(this._translocoService.translate('staff.relationship.error.create'));
      },
      complete: () => {
        this.isLoading = false;
        this._fuseLoadingService.hide();
      }
    });
  }

  /**
   * Cierra el modal
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
