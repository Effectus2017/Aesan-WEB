/** Alineado con Api.Models.Response.SchoolStaffResponse */
export interface SchoolStaffResponse {
  id: number;
  schoolId: number;
  staffId: number;
  assignmentDate: Date;
  assignmentTypeId?: number;
  isPrimary: boolean;
  startDate?: Date;
  endDate?: Date;
  comments?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  firstName?: string;
  middleName?: string;
  fatherLastName?: string;
  motherLastName?: string;
  email?: string;
  assignmentTypeName?: string;
  /** Nombre en inglés del tipo de asignación (JSON camelCase: assignmentTypeNameEN). */
  assignmentTypeNameEN?: string;
  schoolName?: string;
  schoolCode?: string;
  agencyId?: number;
  schoolNumber?: number;
  schoolIsActive?: boolean;
  agencyName?: string;
  agencyIsActive?: boolean;
}
