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

  constructor(
    public dialogRef: MatDialogRef<SiteChangesCancellationsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteChangesCancellationsModalData,
    private fb: FormBuilder
  ) {
    const initialDate = this.parseEndOfOperationDate(data.endOfOperationDate);
    this.form = this.fb.group({
      endOfOperationDate: [initialDate, Validators.required],
    });
  }

  private parseEndOfOperationDate(
    value: string | Date | null | undefined
  ): Date | null {
    if (value == null) {
      return null;
    }
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string' && value) {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  get isFormValid(): boolean {
    return this.form.valid;
  }

  onSubmit(): void {
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
