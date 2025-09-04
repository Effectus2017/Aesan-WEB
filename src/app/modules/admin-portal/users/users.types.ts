export interface UserToken {
    id: string;
    name: string;

    avatar?: string;
    status?: string;

    unique_name?: string;
    email?: string;
    role?: string;
    nameid?: string;
    nbf?: number;
    exp?: number;
    iat?: number;
  }

  export interface RequestUser {
    id?: string;
    firstName?: string;
    middleName?: string;
    fatherLastName?: string;
    motherLastName?: string;
    userName?: string;
    email?: string;
    password?: string;
    role?: any;
    roles?: any;
    imageURL?: string;
    agencyId?: number;
    isActive?: boolean;
    isTemporalPasswordActived?: boolean;
    emailConfirmed?: boolean;
  }

  export interface DTOUserRole {
    id: string;
    name: string;
  }

  export interface Token {
    token_type: string;
    access_token: string;
    expires_in: number;
    refresh_token: string;
  }

  export interface Role {
    id: string;
    name: string;
  }

  export interface ChangePassword {
    email?: string;
    id?: string;
    newPassword?: string;
    password?: string;
  }

  export interface GeneratePassword {
    email: string;
  }

  export interface ResetPassword {
    token: string;
    userId: string;
  }
