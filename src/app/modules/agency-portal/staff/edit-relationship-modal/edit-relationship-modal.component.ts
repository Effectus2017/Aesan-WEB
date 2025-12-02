import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
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
import { AuthService } from 'app/core/auth/auth.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-edit-relationship-modal',
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
})
export class EditRelationshipModalComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  // private _fuseLoadingService = inject(FuseLoadingService); // Eliminado
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _router = inject(Router);
  private _staffService = inject(StaffService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _staffRelationshipService = inject(StaffRelationshipService);
  private _authService = inject(AuthService);
  private _ngZone = inject(NgZone);

  // Lists for selects
  listStaff: Staff[] = [];
  listRelationshipTypes: OptionSelection[] = [];
  yesNoOptions: OptionSelection[] = []; // Nuevo campo para activo/inactivo

  // Current language
  currentLang: string = 'es';

  // Comparator for selects
  compareById = compareById;

  form: FormGroup = this._formBuilder.group({
    relatedStaff: new FormControl('', [Validators.required]),
    relationshipType: new FormControl('', [Validators.required]),
    isActive: new FormControl(true, [Validators.required]), // Nuevo campo para activo/inactivo
    comment: new FormControl('', [Validators.maxLength(500)]), // Campo para comentarios
  });

  // Loading
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<EditRelationshipModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      currentStaffId: number;
      relationship: any; // La relación existente a editar
    },
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    // Obtener el idioma actual
    this.currentLang = this._translocoService.getActiveLang();

    // Suscribirse a cambios de idioma
    this._translocoService.langChanges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lang) => {
        this.currentLang = lang;
      });

    // Suscribirse a eventos de navegación para cerrar el modal
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        this.dialogRef.close(false);
      });

    // Cargar datos iniciales
    this.onLoadInitialData();
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
      excludeRelated: false,
      isList: true,
      staffTypeId: null, // Cambiado de 2 a null para incluir empleados y miembros de junta
      agencyId: agencyId,
    };

    const relationshipQueryParams: QueryParameters = {
      optionKey: 'staffRelationshipType,yesNo',  // Agregar yesNo para opciones activo/inactivo
      names: null,
    };

    // Ejecutar ambas requests en paralelo usando forkJoin
    forkJoin({
      staff: this._staffService.getAllStaffFromDb(staffQueryParams),
      relationshipTypes: this._optionSelectionService.getOptionSelectionByOptionKey(relationshipQueryParams)
    }).subscribe({
      next: (response) => {
        // Ejecutar todos los cambios fuera del ciclo de detección de cambios
        this._ngZone.runOutsideAngular(() => {
          // Procesar respuesta de staff
          if (!isNullOrUndefinedEmptyStringNullArray(response.staff)) {
            // Filtrar el usuario actual para evitar auto-relaciones
            // Editar si lo necesita -- No cambiar
            this.listStaff = response.staff.body.filter((staff: Staff) => staff.id !== this.data.currentStaffId);
          }

          // Procesar respuesta de relationship types y yesNo options
          if (!isNullOrUndefinedEmptyStringNullArray(response.relationshipTypes)) {
            this.listRelationshipTypes = response.relationshipTypes.body.data.filter((option: OptionSelection) => option.optionKey === 'staffRelationshipType');
            this.yesNoOptions = response.relationshipTypes.body.data.filter((option: OptionSelection) => option.optionKey === 'yesNo');
          }

          // Pre-llenar el formulario después de que los datos se hayan cargado
          this.onSetForm();
        });

        // Una sola llamada a detectChanges después de todos los cambios
        this._changeDetectorRef.detectChanges();
      },
      error: (error) => {
        this._notificationService.showErrorDialog(this._translocoService.translate('staff.relationship.modal.error.loadingData'));
      },
      complete: () => {
      }
    });
  }

  private onSetForm(): void {

    if (this.data.relationship) {
      // Intentar diferentes propiedades para encontrar los IDs
      const relationshipTypeId = this.data.relationship.relationshipTypeId ||
                                this.data.relationship.relationshipType?.id ||
                                this.data.relationship.relationshipTypeId;

      const relatedStaffId = this.data.relationship.relatedStaffId ||
                            this.data.relationship.relatedStaff?.id ||
                            this.data.relationship.relatedStaffId;

      // Buscar el tipo de relación por ID
      const relationshipType = this.listRelationshipTypes.find(type => type.id === relationshipTypeId);

      // Buscar el staff relacionado por ID
      const relatedStaff = this.listStaff.find(staff => staff.id === relatedStaffId);

      if (relationshipType && relatedStaff) {
        // Usar setValue para asegurar que se asignen correctamente
        this.form.setValue({
          relatedStaff: relatedStaff,
          relationshipType: relationshipType,
          isActive: this.data.relationship.isActive ?? true,  // Usar el valor existente o true por defecto
          comment: this.data.relationship.comment || ''  // Usar el valor existente o string vacío por defecto
        });

        // Forzar la detección de cambios
        this._changeDetectorRef.markForCheck();
        this._changeDetectorRef.detectChanges();

      }
    }
  }


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
        relationshipTypeId: formValue.relationshipType.id,
        isActive: formValue.isActive, // Incluir el campo isActive en el request
        comment: formValue.comment // Incluir el campo comment en el request
      };

      // Llamar al servicio para actualizar
      this._staffRelationshipService.updateRelationship(updateRequest, {}).subscribe({
        next: (response) => {
          this._notificationService.showSuccessDialog('Relación actualizada exitosamente');
          this.dialogRef.close(true); // true indica que se actualizó correctamente
        },
        error: (error) => {
          this._notificationService.showErrorDialog('Error al actualizar la relación');
        }
      });

    } catch (error) {
      this._notificationService.showErrorDialog('Error inesperado al actualizar la relación');
    } finally {
      this.isLoading = false;
      this._changeDetectorRef.detectChanges();
    }
  }


  onCancel(): void {
    this.dialogRef.close(true);
  }
}
