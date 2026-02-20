import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { UsersService } from './users.service';
import { Role } from '../models/user.types';

export interface RoleInfo {
  role: string;
  description: string;
  permissions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleMappingService {
  private readonly _roles = new BehaviorSubject<Role[]>([]);

  constructor(private _usersService: UsersService) {
    this.loadRolesFromApi();
  }

  /**
   * Carga los roles desde la API (respuesta unificada { data, count } en body).
   */
  private loadRolesFromApi(): void {
    this._usersService.getAllRolesFromDb({ take: 100, skip: 0 }).subscribe({
      next: (response: any) => {
        const data = response?.body?.data ?? [];
        const roles = Array.isArray(data) ? data : [];
        console.log('🔧 RoleMappingService - Roles cargados desde API:', roles);
        this._roles.next(roles);
      },
      error: (error) => {
        console.error('Error loading roles from API:', error);
        this._roles.next([]);
      }
    });
  }

  /**
   * Obtiene el observable de roles
   */
  get roles$(): Observable<Role[]> {
    return this._roles.asObservable();
  }

  /**
   * Verifica si un rol existe en el sistema
   */
  roleExists(roleName: string): boolean {
    const roles = this._roles.value;
    return roles.some(role => role.name === roleName);
  }

  /**
   * Obtiene la descripción de un rol
   */
  getRoleDescription(roleName: string): string {
    const roles = this._roles.value;
    const role = roles.find(r => r.name === roleName);
    return role ? `Rol: ${role.name}` : 'Rol no encontrado';
  }

  /**
   * Obtiene todos los roles disponibles
   */
  getAllRoles(): Role[] {
    return [...this._roles.value];
  }
}
