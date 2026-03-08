export interface TokenResponse {
  nameid: string;
  unique_name: string;
  /** Clave del rol (para lógica). */
  role: string;
  /** Nombre a mostrar del rol en español (desde JWT). */
  roleDisplay?: string;
  /** Nombre a mostrar del rol en inglés (desde JWT). */
  roleDisplayEN?: string;
  /** Lista de roles AESAN disponibles para cambio en el menú (solo cuando el usuario tiene 2+ roles) */
  roles?: string[];
  /** Fecha tope de vigencia del rol actual (ISO), solo cuando el rol seleccionado es secundario */
  roleValidTo?: string;
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
