export interface TokenResponse {
  nameid: string;
  unique_name: string;
  role: string;
  /** Lista de roles AESAN disponibles para cambio en el menú (solo cuando el usuario tiene 2+ roles) */
  roles?: string[];
  userId: string;
  name: string;
  avatar?: string;
  status?: string;
  lastName: string;
  email: string;
  agency?: string;
  agencyId?: number;
  programs?: string;
  programIds?: string;
  permissions?: string[];
  nbf: number;
  exp: number;
  iat: number;
}

export interface Token {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  permissions?: string[];
  /** Roles AESAN disponibles para selección (solo cuando usuario tiene 2+ roles AESAN) */
  roles?: string[];
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
