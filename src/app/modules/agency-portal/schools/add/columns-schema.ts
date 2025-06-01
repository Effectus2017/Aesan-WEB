import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const SATELLITE_SCHOOLS_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
        key: 'name',
        label: 'schools.add.satellite-school.columns.name',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    },
];