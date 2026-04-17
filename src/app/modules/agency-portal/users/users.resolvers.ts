import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { UsersService } from 'app/shared/services/users.service';

// Resolver para editar el perfil del usuario actual en agency-portal
// Solo carga datos personales (sin permisos ni agencias)
// Resolver for editing current user profile in agency-portal
// Loads only personal data and roles (no permissions or agencies)
export const initialProfileUsersResolver: ResolveFn<any> = () => {
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

  return usersService.getUserByIdWithSP({ userId: userId }).pipe(
    map((user) => ({
      user: user.body,
    }))
  );
};

