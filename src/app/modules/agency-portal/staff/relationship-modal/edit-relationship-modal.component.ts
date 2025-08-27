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
import { UpdateStaffRelationshipRequest } from 'app/shared/models/StaffRelationship';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

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
})
export class EditRelationshipModalComponent implements OnInit, OnDestroy {
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
    public dialogRef: MatDialogRef<EditRelationshipModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      currentStaffId: number;
      relationship: any; // La relación existente a editar
    },
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    // Deshabilitar el auto mode del loading service para evitar ExpressionChangedAfterItHasBeenCheckedError
    this._fuseLoadingService.hide();

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

    // Pre-llenar el formulario con los datos de la relación existente
    this.populateForm();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Carga los datos iniciales necesarios para el formulario
   */
  private async loadInitialData(): Promise<void> {
    try {
      this._fuseLoadingService.show();

      // Cargar lista de staff (excluyendo el staff actual)
      const staffQueryParams: QueryParameters = {
        take: 25,
        skip: 0,
        name: null,
        alls: true,
        isList: true,
        staffTypeId: 2,
      };

      this._staffService.getAllStaffFromDb(staffQueryParams).subscribe({
        next: (response: any) => {
          if (!isNullOrUndefinedEmptyStringNullArray(response)) {
            // Filtrar el usuario actual para evitar auto-relaciones
            this.listStaff = response.body.filter((staff: Staff) => staff.id !== this.data.currentStaffId);
            this._changeDetectorRef.detectChanges();
          }
        },
        error: (error) => {
          console.error('Error loading staff:', error);
          this._notificationService.showError('Error al cargar la lista de personal');
        }
      });

      // Cargar tipos de relación
      const relationshipTypeQueryParams: QueryParameters = {
        optionKey: 'staffRelationshipType',
        names: null,
      };
      this._optionSelectionService.getOptionSelectionByOptionKey(relationshipTypeQueryParams).subscribe({
        next: (response: any) => {
          if (!isNullOrUndefinedEmptyStringNullArray(response)) {
            this.listRelationshipTypes = response.body.data;
            this._changeDetectorRef.detectChanges();
          }
        },
        error: (error) => {
          console.error('Error loading relationship types:', error);
          this._notificationService.showError('Error al cargar los tipos de relación');
        }
      });

    } catch (error) {
      console.error('Error in loadInitialData:', error);
      this._notificationService.showError('Error al cargar los datos iniciales');
    } finally {
      this._fuseLoadingService.hide();
    }
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
