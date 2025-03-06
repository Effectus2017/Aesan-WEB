export interface QueryParameters {
  take?: number;
  skip?: number;
  name?: string;
  names?: string;
  alls?: boolean;
  id?: number;
  agencyId?: number;
  programId?: number;
  regionId?: number;
  cityId?: number;
  statusId?: number;
  userId?: string;
  imageUrl?: string;
  rejectionJustification?: string;
  type?: string;
  fileName?: string;
  folderTo?: string;
  roles?: string[];
}

