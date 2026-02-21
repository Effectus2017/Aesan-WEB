import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslocoModule } from '@ngneat/transloco';
import { ColumnSchema, ListFilterResult } from 'app/shared/components/generic-table/generic-table.interface';
import { getFilterableColumns, getFilterParamKey, sanitizeParamKeyForForm } from 'app/shared/utils/list-filter.utils';

/** Configuración de un campo de filtro para la vista (derivada de ColumnSchema). */
export interface ListFilterFieldConfig {
  col: ColumnSchema;
  /** Clave original (puede tener '.') para el resultado emitido. */
  paramKey: string;
  /** Nombre del FormControl (sin '.') para formControlName. */
  formControlKey: string;
  type: ColumnSchema['type'];
  label: string;
  /** Solo para date/date-time: clave del control "hasta". */
  paramKeyTo?: string;
  formControlKeyTo?: string;
}

@Component({
  selector: 'app-list-filter-panel',
  templateUrl: './list-filter-panel.component.html',
  styleUrls: ['./list-filter-panel.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslocoModule,
  ],
})
export class ListFilterPanelComponent implements OnChanges {
  private _formBuilder = inject(UntypedFormBuilder);
  private _filterFields: ListFilterFieldConfig[] = [];

  /** Schema de columnas (se filtran las filterables internamente). */
  @Input() columnsSchema: ColumnSchema[] = [];

  /** Valores iniciales para rellenar el formulario. */
  @Input() initialValues: ListFilterResult = {};

  /** Emite el objeto de filtros al pulsar Aplicar. */
  @Output() apply = new EventEmitter<ListFilterResult>();

  /** Emite al pulsar Restablecer (opcional, para que el padre recargue sin filtros). */
  @Output() resetFilters = new EventEmitter<void>();

  form: FormGroup = this._formBuilder.group({});

  /** Mapa formKey (sin puntos) -> paramKey (original) para emitir el resultado. */
  private _formKeyToParamKey: Record<string, string> = {};

  /** Lista de campos a mostrar (derivada del schema). */
  get filterFields(): ListFilterFieldConfig[] {
    return this._filterFields;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columnsSchema'] || changes['initialValues']) {
      this._buildForm();
    }
  }

  /** Construye el formulario dinámicamente a partir del schema y valores iniciales. */
  private _buildForm(): void {
    const columns = getFilterableColumns(this.columnsSchema);
    const group: Record<string, FormControl> = {};
    this._filterFields = [];
    this._formKeyToParamKey = {};

    for (const col of columns) {
      const paramKey = getFilterParamKey(col);
      if (!paramKey) continue;

      if (col.type === 'date' || col.type === 'date-time') {
        const paramKeyFrom = paramKey + 'From';
        const paramKeyTo = paramKey + 'To';
        const formKeyFrom = sanitizeParamKeyForForm(paramKeyFrom);
        const formKeyTo = sanitizeParamKeyForForm(paramKeyTo);
        group[formKeyFrom] = new FormControl(this._getInitial(paramKeyFrom) ?? null);
        group[formKeyTo] = new FormControl(this._getInitial(paramKeyTo) ?? null);
        this._formKeyToParamKey[formKeyFrom] = paramKeyFrom;
        this._formKeyToParamKey[formKeyTo] = paramKeyTo;
        this._filterFields.push({
          col,
          paramKey: paramKeyFrom,
          formControlKey: formKeyFrom,
          type: col.type,
          label: col.label,
          paramKeyTo: paramKeyTo,
          formControlKeyTo: formKeyTo,
        });
      } else if (col.type === 'boolean') {
        const formKey = sanitizeParamKeyForForm(paramKey);
        group[formKey] = new FormControl(this._getInitial(paramKey) ?? null);
        this._formKeyToParamKey[formKey] = paramKey;
        this._filterFields.push({ col, paramKey, formControlKey: formKey, type: col.type, label: col.label });
      } else {
        const formKey = sanitizeParamKeyForForm(paramKey);
        group[formKey] = new FormControl(this._getInitial(paramKey) ?? '');
        this._formKeyToParamKey[formKey] = paramKey;
        this._filterFields.push({ col, paramKey, formControlKey: formKey, type: col.type, label: col.label });
      }
    }

    this.form = this._formBuilder.group(group);
  }

  private _getInitial(key: string): string | number | boolean | null | undefined {
    const v = this.initialValues[key];
    return v === '' ? undefined : v;
  }

  /** Obtiene el valor del formulario como ListFilterResult (claves originales, sin campos vacíos). */
  getFormValue(): ListFilterResult {
    const raw = this.form.getRawValue();
    const result: ListFilterResult = {};
    for (const [formKey, v] of Object.entries(raw)) {
      if (v === '' || v === null || v === undefined) continue;
      const paramKey = this._formKeyToParamKey[formKey] ?? formKey;
      result[paramKey] = v as string | number | boolean | null | undefined;
    }
    return result;
  }

  onApply(): void {
    this.apply.emit(this.getFormValue());
  }

  onReset(): void {
    this.form.reset(
      Object.fromEntries(Object.keys(this.form.controls).map((k) => [k, null])),
      { emitEvent: false }
    );
    this.resetFilters.emit();
  }
}
