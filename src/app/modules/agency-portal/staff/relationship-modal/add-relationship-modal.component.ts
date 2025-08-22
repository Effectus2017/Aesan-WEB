import { Component, Inject, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { NgIf, NgForOf } from '@angular/common';
import { StaffService } from 'app/shared/services/staff.service';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';
import { StaffList } from 'app/shared/models/Staff';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { compareById, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { QueryParameters } from 'app/shared/models/QueryParameters';

@Component({
  selector: 'app-add-relationship-modal',
  templateUrl: './add-relationship-modal.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    TranslocoModule,
    NgIf,
    NgForOf,
  ],
})
export class AddRelationshipModalComponent implements OnInit {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _staffRelationshipService = inject(StaffRelationshipService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Listas para los dropdowns
  listStaff: StaffList[] = [];
  listRelationshipTypes: OptionSelection[] = [];

  // Comparador para los dropdowns
  compareById = compareById;

  // Formulario
  form = this._formBuilder.group({
    relatedStaffId: new FormControl('', [Validators.required]),
    relationshipTypeId: new FormControl('', [Validators.required]),
  });

  // Loading
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddRelationshipModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentStaffId: number }
  ) {}

  ngOnInit(): void {
    this.loadStaffList();
    this.loadRelationshipTypes();
  }

  ngOnDestroy(): void {
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
    };

    this._staffService.getAllStaffFromDb(queryParams).subscribe({
      next: (response) => {
        if (!isNullOrUndefinedEmptyStringNullArray(response)) {
          this.listStaff = response.body;
        }
      },
      error: (error) => {
        console.error('Error loading staff list:', error);
      },
      complete: () => {
        console.log('Staff list loaded');
      }
    });
  }

  /**
   * Carga los tipos de relación disponibles
   */
  private loadRelationshipTypes(): void {
    this._optionSelectionService.options$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (result?.body?.data) {
        this.listRelationshipTypes = result.body.data.filter(
          (option: OptionSelection) => option.optionKey === 'relationshipType'
        );
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
    const relationshipData = {
      staffId: this.data.currentStaffId,
      relatedStaffId: formValues.relatedStaffId,
      relationshipTypeId: formValues.relationshipTypeId,
      isActive: true,
    };

    // TODO: Implementar la creación de la relación
    console.log('Creating relationship:', relationshipData);

    // Simular creación exitosa
    setTimeout(() => {
      this.isLoading = false;
      this.dialogRef.close({ success: true, data: relationshipData });
    }, 1000);
  }

  /**
   * Cancela la operación
   */
  onCancel(): void {
    this.dialogRef.close();
  }

}
