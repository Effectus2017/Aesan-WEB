export interface TokenResponse {
  id: string;
  name: string;
  lastName: string;
  avatar?: string;
  status?: string;
  unique_name?: string;
  email?: string;
  role?: string;
  nameid?: string;
  nbf?: number;
  exp?: number;
  iat?: number;
  agency?: string;
  program?: string;
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
