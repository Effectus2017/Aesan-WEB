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
import { ColumnSchema, GenericFilterResult } from 'app/shared/components/generic-table/generic-table.interface';
import {
  FilterSchema,
  GenericFilterFieldConfig,
  OnGenericFilterHandlers,
} from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';
import { getFilterableColumns, getFilterParamKey, sanitizeParamKeyForForm, buildRequestParamsFromFiltersSchema } from 'app/shared/utils/generic-filter.utils';

/** Convierte ColumnSchema a FilterSchema para retrocompatibilidad. */
function columnToFilterSchema(col: ColumnSchema): FilterSchema {
  return {
    key: col.key,
    type: col.type as FilterSchema['type'],
    label: col.label,
    keys: col.keys,
  };
}

@Component({
  selector: 'app-generic-filter-panel',
  templateUrl: './generic-filter-panel.component.html',
  styleUrls: ['./generic-filter-panel.component.scss'],
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
export class GenericFilterPanelComponent implements OnChanges {
  private _formBuilder = inject(UntypedFormBuilder);
  private _filterFields: GenericFilterFieldConfig[] = [];

  /** Schema de filtros (prioritario). Si se define, se usa en lugar de columnsSchema. */
  @Input() filtersSchema: FilterSchema[] = [];

  /** Schema de columnas (retrocompatibilidad: se filtran las filterables internamente). */
  @Input() columnsSchema: ColumnSchema[] = [];

  /** Valores iniciales para rellenar el formulario. */
  @Input() initialValues: GenericFilterResult = {};

  /**
   * Handler obligatorio cuando se usa filtersSchema: el padre debe implementar OnGenericFilterHandlers.
   * Si se proporciona, Apply y Restablecer llaman a handler.onFiltersApply y handler.onFiltersReset.
   */
  @Input() handler?: OnGenericFilterHandlers;

  /** Emite el objeto de filtros al pulsar Aplicar (usado cuando no hay handler o sin filtersSchema). */
  @Output() apply = new EventEmitter<GenericFilterResult>();

  /** Emite al pulsar Restablecer (opcional, para que el padre recargue sin filtros). */
  @Output() resetFilters = new EventEmitter<void>();

  form: FormGroup = this._formBuilder.group({});

  /** Mapa formKey (sin puntos) -> paramKey (original) para emitir el resultado. */
  private _formKeyToParamKey: Record<string, string> = {};

  /** Lista de campos a mostrar (derivada del schema). */
  get filterFields(): GenericFilterFieldConfig[] {
    return this._filterFields;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filtersSchema'] || changes['columnsSchema'] || changes['initialValues']) {
      this._buildForm();
    }
  }

  /** Construye el formulario dinámicamente a partir del schema y valores iniciales. */
  private _buildForm(): void {
    const filters: FilterSchema[] =
      this.filtersSchema?.length > 0
        ? this.filtersSchema
        : getFilterableColumns(this.columnsSchema).map(columnToFilterSchema);

    const group: Record<string, FormControl> = {};
    this._filterFields = [];
    this._formKeyToParamKey = {};

    for (const filter of filters) {
      const paramKey = getFilterParamKey(filter);
      if (!paramKey) continue;

      if (filter.type === 'date' || filter.type === 'date-time') {
        const paramKeyFrom = paramKey + 'From';
        const paramKeyTo = paramKey + 'To';
        const formKeyFrom = sanitizeParamKeyForForm(paramKeyFrom);
        const formKeyTo = sanitizeParamKeyForForm(paramKeyTo);
        group[formKeyFrom] = new FormControl(this._getInitial(paramKeyFrom) ?? null);
        group[formKeyTo] = new FormControl(this._getInitial(paramKeyTo) ?? null);
        this._formKeyToParamKey[formKeyFrom] = paramKeyFrom;
        this._formKeyToParamKey[formKeyTo] = paramKeyTo;
        this._filterFields.push({
          filter,
          paramKey: paramKeyFrom,
          formControlKey: formKeyFrom,
          type: filter.type,
          label: filter.label,
          paramKeyTo: paramKeyTo,
          formControlKeyTo: formKeyTo,
        });
      } else if (filter.type === 'boolean') {
        const formKey = sanitizeParamKeyForForm(paramKey);
        group[formKey] = new FormControl(this._getInitial(paramKey) ?? null);
        this._formKeyToParamKey[formKey] = paramKey;
        this._filterFields.push({
          filter,
          paramKey,
          formControlKey: formKey,
          type: filter.type,
          label: filter.label,
        });
      } else {
        const formKey = sanitizeParamKeyForForm(paramKey);
        group[formKey] = new FormControl(this._getInitial(paramKey) ?? '');
        this._formKeyToParamKey[formKey] = paramKey;
        this._filterFields.push({
          filter,
          paramKey,
          formControlKey: formKey,
          type: filter.type,
          label: filter.label,
        });
      }
    }

    this.form = this._formBuilder.group(group);
  }

  private _getInitial(key: string): string | number | boolean | null | undefined {
    const v = this.initialValues[key];
    return v === '' ? undefined : v;
  }

  /** Obtiene el valor del formulario como GenericFilterResult (claves originales, sin campos vacíos). */
  getFormValue(): GenericFilterResult {
    const raw = this.form.getRawValue();
    const result: GenericFilterResult = {};
    for (const [formKey, v] of Object.entries(raw)) {
      if (v === '' || v === null || v === undefined) continue;
      const paramKey = this._formKeyToParamKey[formKey] ?? formKey;
      result[paramKey] = v as string | number | boolean | null | undefined;
    }
    return result;
  }

  /**
   * Construye el objeto de filtros listo para la API a partir del schema y del formulario.
   * Usado cuando filtersSchema está definido: incluye todos los keys del schema con conversión de tipos.
   */
  getFormValueAsRequestParams(): GenericFilterResult {
    const raw = this.form.getRawValue();
    const formWithParamKeys: Record<string, unknown> = {};
    for (const [formKey, v] of Object.entries(raw)) {
      const paramKey = this._formKeyToParamKey[formKey] ?? formKey;
      formWithParamKeys[paramKey] = v;
    }
    return buildRequestParamsFromFiltersSchema(this.filtersSchema, formWithParamKeys, {}) as GenericFilterResult;
  }

  onApply(): void {
    if (this.filtersSchema?.length) {
      const params = this.getFormValueAsRequestParams();
      if (this.handler?.onFiltersApply) {
        this.handler.onFiltersApply(params);
      } else {
        this.apply.emit(params);
      }
    } else {
      this.apply.emit(this.getFormValue());
    }
  }

  onReset(): void {
    this.form.reset(
      Object.fromEntries(Object.keys(this.form.controls).map((k) => [k, null])),
      { emitEvent: false }
    );
    if (this.handler?.onFiltersReset) {
      this.handler.onFiltersReset();
    } else {
      this.resetFilters.emit();
    }
  }
}
