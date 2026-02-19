import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { catchError, distinctUntilChanged, map, Observable, ReplaySubject, Subject, takeUntil, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { UserService } from 'app/shared/services/user.service';
import { isAdminRole, isAgencyRole } from 'app/shared/constants/role-keys';

@Injectable({ providedIn: 'root' })
export class NavigationService implements OnDestroy {
  private _httpClient = inject(HttpClient);
  private _authService = inject(AuthService);
  private _userService = inject(UserService);
  private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);
  private _unsubscribeAll: Subject<void> = new Subject<void>();

  constructor() {
    // Suscribirse a los cambios de usuario
    this._userService.user$
      .pipe(
        takeUntil(this._unsubscribeAll),
        distinctUntilChanged((prev, curr) =>
          prev?.role === curr?.role &&
          prev?.agency === curr?.agency &&
          prev?.programs === curr?.programs
        )
      )
      .subscribe({
        next: () => {
          console.log('Usuario cambiado, recargando navegación...');
          this.reloadNavigation();
        },
        error: (error) => {
          console.error('Error en la suscripción de usuario:', error);
        }
      });

    // Cargar navegación inicial solo si hay un usuario autenticado
    if (this._authService.accessToken) {
      this.reloadNavigation();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for navigation
   */
  get navigation$(): Observable<Navigation> {
    return this._navigation.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all navigation data
   */
  get(): Observable<Navigation> {
    return this._httpClient.get<Navigation>('api/common/navigation').pipe(
      map((navigation) => {
        return this.adjustNavigationByUserRole(navigation);
      }),
      tap((navigation) => {
        this._navigation.next(navigation);
      }),
      catchError((error) => {
        throw error;
      })
    );
  }

  /**
   * Reload navigation
   */
  reloadNavigation(): void {
    const userRole = this._authService.getUserRole();

    if (!userRole) {
      return;
    }

    this.get().pipe(
      catchError(() => {
        return [];
      })
    ).subscribe({
      next: () => console.log('Navegación recargada exitosamente'),
      error: (error) => console.error('Error en la suscripción de recarga:', error)
    });
  }

  private adjustNavigationByUserRole(navigation: Navigation): Navigation {
    const userRole = this._authService.getUserRole();
    const userPermissionsRaw = this._authService.getUserPermissions?.();
    
    // Asegurar que userPermissions sea siempre un array
    let userPermissions: string[] = [];
    if (Array.isArray(userPermissionsRaw)) {
      userPermissions = userPermissionsRaw;
    } else if (userPermissionsRaw !== null && userPermissionsRaw !== undefined) {
      console.warn('getUserPermissions devolvió un valor no-array:', userPermissionsRaw);
      userPermissions = [];
    }

    let nav: FuseNavigationItem[] = [];
    if (isAdminRole(userRole)) {
      nav = navigation.admin ?? [];
    } else if (isAgencyRole(userRole)) {
      nav = navigation.agency ?? [];
    } else {
      nav = navigation.aesan ?? [];
    }
    // Agrega los ítems compartidos si existen
    if (navigation.shared && navigation.shared.length > 0) {
      nav = [...nav, ...navigation.shared];
    }

    // Aplica el ajuste de rutas y permisos como antes
    const adjusted = this.adjustLinks(nav, userRole, userPermissions);

    // Devuelve tanto default como horizontal para compatibilidad con los layouts
    return { default: adjusted, horizontal: adjusted };
  }

  private adjustLinks(items: FuseNavigationItem[], userRole: string, userPermissions: string[]): FuseNavigationItem[] {
    // Validar que userPermissions sea un array
    if (!Array.isArray(userPermissions)) {
      console.warn('userPermissions no es un array válido en adjustLinks:', userPermissions);
      userPermissions = [];
    }

    let prefix = this.getRoutePrefix(userRole, '');
    
    return items
      .filter((item) => this.isItemAllowedByPermissions(item, userPermissions))
      .map((item) => {
        const newItem = { ...item };
        if (newItem.link && !this.isExternalLink(newItem.link)) {
          const cleanLink = this.cleanRoute(newItem.link);
          newItem.link = `${prefix}${cleanLink}`;
        }
        if (newItem.children) {
          newItem.children = this.adjustLinks(newItem.children, userRole, userPermissions);
        }
        // Asegurar que queryParams se mantenga si existe
        if (item.queryParams) {
          newItem.queryParams = item.queryParams;
        }
        return newItem;
      });
  }

  private getRoutePrefix(userRole: string, userPrograms: string): string {
    if (isAdminRole(userRole)) {
      return '/admin-portal';
    }
    if (isAgencyRole(userRole)) {
      return '/agency-portal';
    }
    return '/aesan-portal';
  }

  private cleanRoute(route: string): string {
    // Eliminar prefijos existentes
    const prefixes = ['/admin-portal', '/agency-portal', '/aesan-portal'];
    let cleanRoute = route;

    for (const prefix of prefixes) {
      while (cleanRoute.includes(prefix)) {
        cleanRoute = cleanRoute.replace(prefix, '');
      }
    }

    // Limpiar dobles slashes y asegurar que comience con /
    cleanRoute = cleanRoute.replace(/\/+/g, '/');
    if (!cleanRoute.startsWith('/')) {
      cleanRoute = '/' + cleanRoute;
    }

    return cleanRoute;
  }

  private isExternalLink(link: string): boolean {
    return link.startsWith('http') || link.startsWith('/sign-in') || link.startsWith('/sign-up');
  }


  private isItemAllowedByPermissions(item: FuseNavigationItem, userPermissions: string[]): boolean {
    // Validar que userPermissions sea un array
    if (!Array.isArray(userPermissions)) {
      console.warn('userPermissions no es un array en isItemAllowedByPermissions:', userPermissions);
      return true; // Si no podemos validar, permitir el item por defecto
    }

    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }

    // Validar que item.permissions sea un array de strings
    if (!Array.isArray(item.permissions)) {
      console.warn('item.permissions no es un array:', item.permissions);
      return true;
    }

    return item.permissions.some((perm) => {
      // Validar que perm sea un string
      if (typeof perm !== 'string') {
        console.warn('Permiso no es un string:', perm);
        return false;
      }
      return userPermissions.includes(perm);
    });
  }

}
