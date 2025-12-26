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
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
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

  form: FormGroup = this._formBuilder.group({
    relatedStaff: new FormControl('', [Validators.required]),
    relationshipType: new FormControl('', [Validators.required]),
    comment: new FormControl('', [Validators.maxLength(500)]),
  });

  // Loading
  isLoading: boolean = false; // Para el submit
  isInitialLoading: boolean = false; // Para la carga inicial

  constructor(
    public dialogRef: MatDialogRef<AdminAddRelationshipModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentStaffId: number },
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    // Deshabilitar el auto mode del loading service para evitar ExpressionChangedAfterItHasBeenCheckedError
    this._fuseLoadingService.setAutoMode(false);

    this.loadInitialData();

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
   * Carga los datos iniciales (staff y tipos de relación) usando forkJoin
   */
  private loadInitialData(): void {
    this.isInitialLoading = true;
    this._changeDetectorRef.markForCheck();

    const staffQueryParams: QueryParameters = {
      take: 25,
      skip: 0,
      name: null,
      alls: true,
      excludeRelated: true,  // Excluir staff ya relacionado (modal Add)
      isList: true,  // Mantener por compatibilidad
      staffTypeId: null, // Cambiado de 2 a null para incluir empleados y miembros de junta
      agencyId: null,
    };

    const relationshipQueryParams: QueryParameters = {
      optionKey: 'relationshipType',
      names: null,
    };

    // Ejecutar ambas requests en paralelo usando forkJoin
    forkJoin({
      staff: this._staffService.getAllStaffFromDb(staffQueryParams),
      relationshipTypes: this._optionSelectionService.getOptionSelectionByOptionKey(relationshipQueryParams)
    }).subscribe({
      next: (response) => {
        // Procesar respuesta de staff
        if (!isNullOrUndefinedEmptyStringNullArray(response.staff?.body?.data)) {
          // Filtrar el staff actual para evitar auto-relación
          this.listStaff = response.staff.body.data.filter((staff: Staff) => staff.id !== this.data.currentStaffId);
        }

        // Procesar respuesta de relationship types
        if (!isNullOrUndefinedEmptyStringNullArray(response.relationshipTypes?.body?.data)) {
          this.listRelationshipTypes = response.relationshipTypes.body.data;
        }

        this.isInitialLoading = false;
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.isInitialLoading = false;
        this._notificationService.showError(this._translocoService.translate('staff.relationship.modal.error.loadingData'));
        this._changeDetectorRef.markForCheck();
      },
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
      comment: formValues.comment || undefined,
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
