import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

export const READABILITY_MODULE_HOUSEHOLD_MEMBERS_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
        key: 'name',
        label: 'readability-module.add.householdMembers.columns.name',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    },
    {
        key: 'lastName',
        label: 'readability-module.add.householdMembers.columns.lastName',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    },
    {
        key: 'age',
        label: 'readability-module.add.householdMembers.columns.age',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    },
    {
        key: 'isStudent',
        label: 'readability-module.add.householdMembers.columns.isStudent',
        sortable: true,
        type: 'boolean' as const,
        searchable: true,
        visible: true
    },
    {
        key: 'grade',
        label: 'readability-module.add.householdMembers.columns.grade',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    },
    {
        key: 'idDiningRoom',
        label: 'readability-module.add.householdMembers.columns.idDiningRoom',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    },
    {
        key: 'isFoster',
        label: 'readability-module.add.householdMembers.columns.isFoster',
        sortable: true,
        type: 'boolean' as const,
        searchable: true,
        visible: true
    },
    {
        key: 'isMigrant',
        label: 'readability-module.add.householdMembers.columns.isMigrant',
        sortable: true,
        type: 'boolean' as const,
        searchable: true,
        visible: true
    }
];

export const READABILITY_MODULE_HOUSEHOLD_INCOME_CHILD_COLUMNS_SCHEMA: ColumnSchema[] = [

    {
        key: 'name',
        label: 'readability-module.add.householdMembers.columns.name',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    },
    {
        key: 'lastName',
        label: 'readability-module.add.householdMembers.columns.lastName',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    },
    {
        key: 'income',
        label: 'readability-module.add.householdIncome.columns.income',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    }
];

export const READABILITY_MODULE_HOUSEHOLD_INCOME_COLUMNS_SCHEMA: ColumnSchema[] = [
    {
        key: 'name',
        label: 'readability-module.add.householdMembers.columns.name',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    },
    {
        key: 'lastName',
        label: 'readability-module.add.householdMembers.columns.lastName',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    },
    {
        key: 'income',
        label: 'readability-module.add.householdIncome.columns.income',
        sortable: true,
        type: 'text' as const,
        searchable: true,
        visible: true
    }
];
