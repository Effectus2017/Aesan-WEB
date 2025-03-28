import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const AGENCY_DASHBOARD_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
        key: 'nombre',
        type: 'text',
        label: 'Nombre',
        visible: true,
        sortable: true,
        searchable: false
    },
    {
        key: 'tipo',
        type: 'text',
        label: 'Tipo',
        visible: true,
        sortable: false,
        searchable: false
    },
    {
        key: 'estado',
        type: 'text',
        label: 'Estado',
        visible: true,
        sortable: false,
        searchable: false
    },
    {
        key: 'fechaCreacion',
        type: 'date',
        label: 'Fecha de Creación',
        visible: true,
        sortable: false,
        searchable: false
    }
];
