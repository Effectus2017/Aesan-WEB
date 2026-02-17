import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslocoModule } from '@ngneat/transloco';

export interface AddSecondaryRoleModalData {
  listRoles: { id: string; name: string }[];
  /** Id del rol principal (no se muestra en el select). */
  primaryRoleId?: string;
  /** Ids de roles ya asignados como secundarios (no se muestran), salvo el de editRow si existe. */
  excludeRoleIds?: string[];
  editRow?: { role: { id: string; name: string } | null; comment: string | null; validFrom: string | null; validTo: string | null; index: number };
}

export interface AddSecondaryRoleModalResult {
  role: { id: string; name: string };
  comment: string | null;
  validFrom: string | null;
  validTo: string | null;
}

@Component({
  selector: 'app-add-secondary-role-modal',
  templateUrl: './add-secondary-role-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    TranslocoModule,
  ],
})
export class AddSecondaryRoleModalComponent {
  form: FormGroup;
  rolesFiltered: { id: string; name: string }[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddSecondaryRoleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddSecondaryRoleModalData,
  ) {
    const edit = data?.editRow;
    const fromVal = edit?.validFrom ?? null;
    const toVal = edit?.validTo ?? null;
    const commentVal = edit?.comment ?? null;
    this.form = new FormGroup(
      {
        role: new FormControl(edit?.role ?? null, Validators.required),
        comment: new FormControl(commentVal),
        validFrom: new FormControl(fromVal),
        validTo: new FormControl(toVal),
      },
      { validators: this.dateRangeValidator },
    );
    this.updateRolesFiltered();
  }

  dateRangeValidator(g: AbstractControl): { dateRange: boolean } | null {
    const from = g.get('validFrom')?.value;
    const to = g.get('validTo')?.value;
    if (from && to && new Date(to) <= new Date(from)) {
      return { dateRange: true };
    }
    return null;
  }

  private updateRolesFiltered(): void {
    const raw: any = this.data?.listRoles ?? [];
    const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.Data ?? []);
    const normalized = (Array.isArray(list) ? list : []).map((r: any) => ({
      id: String(r?.id ?? r?.Id ?? ''),
      name: String(r?.name ?? r?.Name ?? '').trim(),
    })).filter((r) => r.id && r.name);
    const primaryId = this.data?.primaryRoleId ? String(this.data.primaryRoleId) : undefined;
    const excludeIds = new Set(this.data?.excludeRoleIds ?? []);
    if (primaryId) excludeIds.add(primaryId);
    // En modo edición, el rol que se edita debe seguir visible (no está en excludeRoleIds que envía el padre)
    this.rolesFiltered = normalized
      .filter((r) => !excludeIds.has(r.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  get isEditMode(): boolean {
    return !!this.data?.editRow;
  }

  get modalTitleKey(): string {
    return this.isEditMode ? 'users.edit.secondaryRoles.modal.editTitle' : 'users.edit.secondaryRoles.modal.addTitle';
  }

  get submitKey(): string {
    return this.isEditMode ? 'users.edit.secondaryRoles.modal.save' : 'users.edit.secondaryRoles.modal.add';
  }

  onConfirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const role = this.form.get('role')?.value as { id: string; name: string };
    const comment = this.form.get('comment')?.value ?? null;
    const validFrom = this.form.get('validFrom')?.value ?? null;
    const validTo = this.form.get('validTo')?.value ?? null;
    if (!role) return;
    const commentStr = comment != null && String(comment).trim() !== '' ? String(comment).trim() : null;
    const fromStr = validFrom ? (typeof validFrom === 'string' ? validFrom : (validFrom as Date).toISOString().slice(0, 10)) : null;
    const toStr = validTo ? (typeof validTo === 'string' ? validTo : (validTo as Date).toISOString().slice(0, 10)) : null;
    this.dialogRef.close({ role, comment: commentStr, validFrom: fromStr, validTo: toStr } as AddSecondaryRoleModalResult);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
