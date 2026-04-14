import {
  Component,
  Inject,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslocoModule } from '@ngneat/transloco';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';

export interface SiteChangesCancellationsModalData {
  siteId: number;
  endOfOperationDate?: string | Date | null;
}

@Component({
  selector: 'app-site-changes-cancellations-modal',
  templateUrl: './site-changes-cancellations-modal.component.html',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    TranslocoModule,
  ],
})
export class SiteChangesCancellationsModalComponent {
  form: FormGroup;
  isLoading = false;
  /** Máximo permitido (hoy); no se permiten fechas futuras. */
  maxEndOfOperationDate = new Date();

  constructor(
    public dialogRef: MatDialogRef<SiteChangesCancellationsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteChangesCancellationsModalData,
    private fb: FormBuilder
  ) {
    const initialDate = this._parseEndOfOperationDate(data.endOfOperationDate);
    this.form = this.fb.group({
      endOfOperationDate: [initialDate, Validators.required],
    });
  }

  private _parseEndOfOperationDate(
    value: string | Date | null | undefined
  ): Date | null {
    if (value == null || value === '') {
      return null;
    }
    const d =
      value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(d.getTime())) {
      return null;
    }
    return this._clampEndDateToToday(d);
  }

  private _clampEndDateToToday(d: Date): Date {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date();
    const max = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return day.getTime() > max.getTime() ? max : day;
  }

  get isFormValid(): boolean {
    return this.form.valid;
  }

  onSubmit(): void {
    if (this.isLoading) return;
    if (!this.isFormValid) {
      return;
    }
    const value = this.form.get('endOfOperationDate')?.value;
    const endOfOperationDateOnly =
      value instanceof Date ? value.toISOString().split('T')[0] : value;
    this.dialogRef.close({
      action: 'submit',
      endOfOperationDate: endOfOperationDateOnly,
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
