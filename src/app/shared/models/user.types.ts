export interface TokenResponse {
  nameid: string;
  unique_name: string;
  role: string;
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
  refresh_token: string;
  permissions: string[];
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
