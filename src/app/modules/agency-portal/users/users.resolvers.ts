import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { UsersService } from 'app/shared/services/users.service';

// Resolver para editar el perfil del usuario actual en agency-portal
// Solo carga datos personales y roles (sin permisos ni agencias)
// Resolver for editing current user profile in agency-portal
// Loads only personal data and roles (no permissions or agencies)
export const initialProfileUsersResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Users service
  // Servicio de usuarios
  const usersService = inject(UsersService);
  // Auth service
  // Servicio de autenticación
  const authService = inject(AuthService);

  // Obtener el ID del usuario autenticado
  const userId = authService.getUserId();

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  return forkJoin([
    usersService.getUserByIdWithSP({ userId: userId }),
    usersService.getAllRolesFromDb({
      take: 25,
      skip: 0,
    }),
  ]).pipe(
    map(([user, roles]) => ({
      user: user.body,
      roles: roles.body
    }))
  );
};

