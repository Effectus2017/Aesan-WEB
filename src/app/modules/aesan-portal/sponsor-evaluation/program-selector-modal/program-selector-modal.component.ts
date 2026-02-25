import { ChangeDetectorRef, Component, inject, Inject, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { Program } from 'app/shared/models/Program';
import { compareById } from 'app/shared/utils';

export interface ProgramSelectorModalData {
  /** Lista de programas disponibles. */
  programs: Program[];
  /** Programa seleccionado actualmente (opcional). */
  currentProgram?: Program | null;
}

@Component({
  selector: 'app-program-selector-modal',
  standalone: true,
  templateUrl: './program-selector-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    TranslocoModule,
  ],
})
export class ProgramSelectorModalComponent implements OnInit {
  private _cdr = inject(ChangeDetectorRef);
  private _fb = inject(FormBuilder);

  form: FormGroup;
  listPrograms: Program[] = [];
  compareById = compareById;

  constructor(
    public dialogRef: MatDialogRef<ProgramSelectorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProgramSelectorModalData
  ) {
    this.form = this._fb.group({
      program: [this.data.currentProgram, Validators.required]
    });
  }

  ngOnInit(): void {
    this.listPrograms = this.data.programs || [];
    this._cdr.markForCheck();
  }

  /** Cierra el modal sin guardar. */
  onCancel(): void {
    this.dialogRef.close(null);
  }

  /** Guarda la selección y cierra el modal. */
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const selectedProgram = this.form.get('program')?.value;
    this.dialogRef.close(selectedProgram);
  }
}
