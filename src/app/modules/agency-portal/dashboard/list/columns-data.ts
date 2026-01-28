// Datos para las tarjetas KPI
export const agencyDashboardCardsData = [
  {
    id: 'totalEscuelas',
    title: 'agency.dashboard.kpis.totalSchools',
    value: '0',
    color: 'text-teal-600',
    bgColor: 'bg-teal-500',
    fullWidth: false
  },
  {
    id: 'totalSitios',
    title: 'agency.dashboard.kpis.totalSites',
    value: '70',
    color: 'text-teal-600',
    bgColor: 'bg-teal-500',
    fullWidth: false
  },
  {
    id: 'presupuestoAprobado',
    title: 'agency.dashboard.kpis.approvedBudget',
    value: '$0',
    color: 'text-teal-600',
    bgColor: 'bg-teal-500',
    fullWidth: false
  }
];

// Datos para el gráfico de raciones por mes
// Nota: Los meses se traducirán dinámicamente en el componente
export const rationsByMonthData = [
  { monthKey: 'january', value: 0 },
  { monthKey: 'february', value: 0 },
  { monthKey: 'march', value: 0 },
  { monthKey: 'april', value: 0 }
];

// Datos para el gráfico de visitas coordinadas
// Nota: Los nombres se traducirán dinámicamente en el componente
export const coordinatedVisitsData = [
  { nameKey: 'initial', value: 0 },
  { nameKey: 'followUp', value: 0 }
];

// Datos para la tabla de formularios
export const agencyDashboardTableData = [
  {
    id: 1,
    formNumber: '123-432',
    formName: 'Presupuesto',
    status: 'Aprobado',
    submissionDate: new Date('0001-01-01'),
    approvalDate: new Date('0001-01-01')
  },
  {
    id: 2,
    formNumber: '123-433',
    formName: 'Manejo Financiero',
    status: 'Pendiente a Aprobar',
    submissionDate: new Date('0001-01-01'),
    approvalDate: new Date('0001-01-01')
  },
  {
    id: 3,
    formNumber: '123-434',
    formName: 'Solicitud al Programa',
    status: 'Aprobado',
    submissionDate: new Date('0001-01-01'),
    approvalDate: new Date('0001-01-01')
  },
  {
    id: 4,
    formNumber: '123-435',
    formName: 'Raciones',
    status: 'Aprobado',
    submissionDate: new Date('0001-01-01'),
    approvalDate: new Date('0001-01-01')
  }
];

