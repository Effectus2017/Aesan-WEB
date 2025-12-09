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
    value: '$50,987.35',
    color: 'text-teal-600',
    bgColor: 'bg-teal-500',
    fullWidth: false
  }
];

// Datos para el gráfico de raciones por mes
export const rationsByMonthData = [
  { month: 'Enero', value: 195 },
  { month: 'Febrero', value: 190 },
  { month: 'Marzo', value: 198 },
  { month: 'Abril', value: 160 }
];

// Datos para el gráfico de visitas coordinadas
export const coordinatedVisitsData = [
  { name: 'Visita Inicial', value: 74.4 },
  { name: 'Visita de Seguimiento', value: 24.6 }
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

