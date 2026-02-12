import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/shared/services/user.service';
import { environment } from 'environments/environment';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { Token, TokenResponse } from '../../shared/models/user.types';
import { LoginRequest } from 'app/shared/models/Request/LoginRequest';
import { SignUpRequest } from 'app/shared/models/Request/SignUpRequest';
import { UnlockSessionRequest } from 'app/shared/models/Request/UnlockSessionRequest';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authenticated: boolean = false;
  private _httpClient = inject(HttpClient);
  private _userService = inject(UserService);
  private apiUrl = `${environment.baseHttpUrl}/auth`;
  private _permissions: string[] = [];

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for access token
   */
  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  get permissions(): string[] {
    return this._permissions;
  }

  set permissions(permissions: string[]) {
    this._permissions = permissions;
  }

  hasPermission(permission: string): boolean {
    return this._permissions.includes(permission);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Decodifica el payload del JWT manejando correctamente UTF-8
   * @param payloadPart Parte del token JWT a decodificar
   * @returns Objeto decodificado del payload
   */
  private decodeJwtPayload(payloadPart: string): any {
    try {
      // Normalizar Base64 URL-safe a Base64 estándar
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');

      // Decodificar Base64
      const binaryString = atob(base64);

      // Convertir a bytes y luego a UTF-8
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decodificar como UTF-8
      const decodedPayload = new TextDecoder('utf-8').decode(bytes);

      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error al decodificar el payload del token:', error);
      throw error;
    }
  }

  /**
   * Convierte el payload decodificado del JWT en TokenResponse (normaliza role y roles).
   */
  private payloadToTokenResponse(payload: Record<string, unknown>): TokenResponse {
    const rolesClaim = payload.roles;
    const rolesArray = typeof rolesClaim === 'string'
      ? (rolesClaim ? (rolesClaim as string).split(',').map((r: string) => r.trim()).filter(Boolean) : undefined)
      : Array.isArray(rolesClaim)
        ? (rolesClaim as string[])
        : undefined;

    return {
      nameid: payload.nameid as string,
      unique_name: payload.unique_name as string,
      role: Array.isArray(payload.role) ? (payload.role[0] as string) : (payload.role as string),
      roles: rolesArray,
      userId: payload.userId as string,
      name: payload.name as string,
      lastName: payload.lastName as string,
      email: payload.email as string,
      avatar: payload.avatar as string | undefined,
      status: payload.status as string | undefined,
      agency: payload.agency as string | undefined,
      agencyId: payload.agencyId as number | undefined,
      programs: payload.programs as string | undefined,
      programIds: payload.programIds as string | undefined,
      permissions: (payload.permissions as string[] | undefined) ?? [],
      nbf: payload.nbf as number,
      exp: payload.exp as number,
      iat: payload.iat as number,
    };
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  signIn(credentials: LoginRequest): Observable<any> {
    if (this._authenticated) {
      return throwError('User is already logged in.');
    }

    return this._httpClient.post(`${this.apiUrl}/login`, credentials).pipe(
      switchMap((response: any) => {
        const token: Token = response as Token;
        try {
          const payloadPart = token.access_token.split('.')[1];
          const payload = this.decodeJwtPayload(payloadPart);
          const user = this.payloadToTokenResponse(payload);

          // Store the access token in the local storage
          this.accessToken = token.access_token;

          // Set the authenticated flag to true
          this._authenticated = true;

          // Store the user on the user service
          this._userService.user = user;

          // Store the permissions
          this._permissions = user.permissions ?? [];

          // Return a new observable with the response
          return of(response);
        } catch (error) {
          console.error('Error al decodificar el token en signIn:', error);
          return throwError(() => new Error('Error al procesar el token de autenticación'));
        }
      })
    );
  }

  signInUsingToken(): Observable<any> {
    // Return true
    return of(true);
  }

  signOut(): Observable<any> {
    // Remove the access token from the local storage
    localStorage.removeItem('accessToken');

    // Remove agency-related data from local storage
    localStorage.removeItem('agencyPrograms');
    localStorage.removeItem('agencyIsDayCareHomeId');

    // Set the authenticated flag to false
    this._authenticated = false;

    // Return the observable
    return of(true);
  }

  signUp(user: SignUpRequest): Observable<any> {
    return this._httpClient.post('api/auth/sign-up', user);
  }

  unlockSession(credentials: UnlockSessionRequest): Observable<any> {
    return this._httpClient.post('api/auth/unlock-session', credentials);
  }

  /**
   * Selecciona el rol con el que el usuario desea entrar (usuarios multi-rol AESAN).
   * Actualiza el token y el usuario en el servicio.
   */
  selectRole(role: string): Observable<Token> {
    return this._httpClient.post<Token>(`${this.apiUrl}/select-role`, { role }).pipe(
      switchMap((response: Token) => {
        try {
          const payloadPart = response.access_token.split('.')[1];
          const payload = this.decodeJwtPayload(payloadPart);
          const user = this.payloadToTokenResponse(payload);

          this.accessToken = response.access_token;
          this._authenticated = true;
          this._userService.user = user;
          this._permissions = user.permissions ?? [];

          return of(response);
        } catch (error) {
          console.error('Error al decodificar el token en selectRole:', error);
          return throwError(() => new Error('Error al procesar el token de autenticación'));
        }
      })
    );
  }

  check(): Observable<boolean> {
    // Verificar si el usuario está autenticado
    if (this._authenticated) {
      return of(true);
    }

    // Verificar la disponibilidad del token de acceso
    if (!this.accessToken) {
      return of(false);
    }

    // Verificar la fecha de expiración del token de acceso
    if (AuthUtils.isTokenExpired(this.accessToken)) {
      return of(false);
    }

    // Si el token de acceso existe y no ha expirado, obtener los datos del usuario
    const userData = this.getUserDataFromToken();
    if (userData) {
      this._userService.user = userData;
      this._authenticated = true;
      // Los permisos ya se cargan en getUserDataFromToken()
      return of(true);
    }

    // Si no se pueden obtener los datos del usuario, considerar que no está autenticado
    return of(false);
  }

  getUserRole(): string | null {
    const payloadPart = this.accessToken.split('.')[1];
    if (!payloadPart) {
        return null;
    }
    try {
      const user = this.decodeJwtPayload(payloadPart) as Record<string, unknown>;
      const role = user.role;
      if (Array.isArray(role) && role.length > 0) {
        return role[0] as string;
      }
      return typeof role === 'string' ? role : null;
    } catch (error) {
      return null;
    }
  }

  getUserPermissions(): string[] | null {
    const payloadPart = this.accessToken.split('.')[1];
    if (!payloadPart) {
        return null;
    }
    try {
      const user = this.decodeJwtPayload(payloadPart) as TokenResponse;
      return user.permissions ?? [];
    } catch (error) {
      return null;
    }
  }

  getUserAgency(): string | null {
    const payloadPart = this.accessToken.split('.')[1];
    if (!payloadPart) {
        return null;
    }
    try {
      const user = this.decodeJwtPayload(payloadPart) as TokenResponse;
      return user.agency;
    } catch (error) {
      return null;
    }
  }

  getUserPrograms(): string | null {
    const payloadPart = this.accessToken.split('.')[1];
    if (!payloadPart) {
        return null;
    }
    try {
      const user = this.decodeJwtPayload(payloadPart) as TokenResponse;
      return user.programs;
    } catch (error) {
      return null;
    }
  }

  getUserId(): string | null {
    const payloadPart = this.accessToken.split('.')[1];
    if (!payloadPart) {
        return null;
    }
    try {
      const user = this.decodeJwtPayload(payloadPart) as TokenResponse;
      return user.nameid;
    } catch (error) {
      return null;
    }
  }

  getAgencyId(): number | null {
    const payloadPart = this.accessToken.split('.')[1];
    if (!payloadPart) {
        return null;
    }
    try {
      const user = this.decodeJwtPayload(payloadPart) as TokenResponse;
      return user.agencyId;
    } catch (error) {
      return null;
    }
  }

  getUserDataFromToken(): TokenResponse | null {
    const token = this.accessToken;
    if (!token) {
        return null;
    }
    try {
        const payloadPart = token.split('.')[1];
        const payload = this.decodeJwtPayload(payloadPart);
        const userData = this.payloadToTokenResponse(payload);

        // Cargar los permisos en el servicio
        this._permissions = userData.permissions || [];
        console.log('AuthService - Loaded permissions from token:', this._permissions);

        return userData;
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
  }


}
