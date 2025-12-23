import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
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
// import { FuseLoadingService } from '@fuse/services/loading'; // Eliminado para evitar ExpressionChangedAfterItHasBeenCheckedError
import { UpdateStaffRelationshipRequest } from 'app/shared/models/StaffRelationship';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgZone } from '@angular/core';

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
    TranslocoModule,
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush, // Comentado para evitar problemas
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
  // private _fuseLoadingService = inject(FuseLoadingService); // Eliminado
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _router = inject(Router);
  private _staffService = inject(StaffService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _staffRelationshipService = inject(StaffRelationshipService);
  private _ngZone = inject(NgZone);

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
  });

  // Loading
  isLoading: boolean = false; // Para el submit
  isInitialLoading: boolean = false; // Para la carga inicial

  constructor(
    public dialogRef: MatDialogRef<AdminEditRelationshipModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      currentStaffId: number;
      relationship: any; // La relación existente a editar
    },
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    // Deshabilitar el auto mode del loading service para evitar ExpressionChangedAfterItHasBeenCheckedError
    // this._fuseLoadingService.hide(); // Eliminado

    // Suscribirse a eventos de navegación para cerrar el modal
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        this.dialogRef.close();
      });

    // Cargar datos iniciales
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Carga los datos iniciales necesarios para el formulario usando forkJoin
   */
  private loadInitialData(): void {
    this.isInitialLoading = true;
    this._changeDetectorRef.markForCheck();

    const staffQueryParams: QueryParameters = {
      take: 25,
      skip: 0,
      name: null,
      alls: true,
      excludeRelated: false,  // Incluir todo el staff (modal Edit)
      isList: true,  // Mantener por compatibilidad
      staffTypeId: null, // Cambiado de 2 a null para incluir empleados y miembros de junta
      agencyId: null,
    };

    const relationshipTypeQueryParams: QueryParameters = {
      optionKey: 'staffRelationshipType',
      names: null,
    };

    // Ejecutar ambas requests en paralelo usando forkJoin
    forkJoin({
      staff: this._staffService.getAllStaffFromDb(staffQueryParams),
      relationshipTypes: this._optionSelectionService.getOptionSelectionByOptionKey(relationshipTypeQueryParams)
    }).subscribe({
      next: (response) => {
        // Procesar respuesta de staff
        if (!isNullOrUndefinedEmptyStringNullArray(response.staff?.body)) {
          // Filtrar el usuario actual para evitar auto-relaciones
          this.listStaff = response.staff.body.filter((staff: Staff) => staff.id !== this.data.currentStaffId);
        }

        // Procesar respuesta de relationship types
        if (!isNullOrUndefinedEmptyStringNullArray(response.relationshipTypes?.body?.data)) {
          this.listRelationshipTypes = response.relationshipTypes.body.data.filter((option: OptionSelection) => option.optionKey === 'staffRelationshipType');
        }

        // Pre-llenar el formulario después de que los datos se hayan cargado
        this.populateForm();

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
   * Pre-llena el formulario con los datos de la relación existente
   */
  private populateForm(): void {
    if (this.data.relationship) {
      this.form.patchValue({
        relatedStaff: this.data.relationship.relatedStaff,
        relationshipType: this.data.relationship.relationshipType
      });
    }
  }

  /**
   * Maneja el envío del formulario
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    try {
      this.isLoading = true;
      this._changeDetectorRef.detectChanges();

      const formValue = this.form.value;

      // Crear request de actualización
      const updateRequest: UpdateStaffRelationshipRequest = {
        id: this.data.relationship.id,
        relationshipTypeId: formValue.relationshipType.id
      };

      // Llamar al servicio para actualizar
      this._staffRelationshipService.updateRelationship(updateRequest, {}).subscribe({
        next: (response) => {
          this._notificationService.showSuccess('Relación actualizada exitosamente');
          this.dialogRef.close(true); // true indica que se actualizó correctamente
        },
        error: (error) => {
          console.error('Error updating relationship:', error);
          this._notificationService.showError('Error al actualizar la relación');
        }
      });

    } catch (error) {
      console.error('Error in onSubmit:', error);
      this._notificationService.showError('Error inesperado al actualizar la relación');
    } finally {
      this.isLoading = false;
      this._changeDetectorRef.detectChanges();
    }
  }

  /**
   * Cancela la operación y cierra el modal
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
