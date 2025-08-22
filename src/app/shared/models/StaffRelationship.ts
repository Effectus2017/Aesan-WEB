export interface StaffRelationship {
  id: number;
  staffId: number;
  relatedStaffId: number;
  relationshipTypeId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DTOStaffForRelationship {
  id: number;
  fullName: string;
  position?: string;
  staffType?: string;
  email?: string;
  isActive: boolean;
}

export interface DTOStaffRelationship {
  id: number;
  staff?: DTOStaffForRelationship;
  relatedStaff?: DTOStaffForRelationship;
  relationshipType?: string;
  relationshipTypeEn?: string;
  relationshipTypeId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateStaffRelationshipRequest {
  staffId: number;
  relatedStaffId: number;
  relationshipTypeId: number;
}

export interface UpdateStaffRelationshipRequest {
  id: number;
  relationshipTypeId: number;
}
