import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { catchError, distinctUntilChanged, map, Observable, ReplaySubject, Subject, takeUntil, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { UserService } from 'app/shared/services/user.service';

@Injectable({ providedIn: 'root' })
export class NavigationService implements OnDestroy {
  private _httpClient = inject(HttpClient);
  private _authService = inject(AuthService);
  private _userService = inject(UserService);
  private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);
  private _unsubscribeAll: Subject<void> = new Subject<void>();
  private _processedItems = new Set<string>();

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
        console.log('Navegación obtenida, ajustando por rol...');
        return this.adjustNavigationByUserRole(navigation);
      }),
      tap((navigation) => {
        console.log('Emitiendo nueva navegación...');
        this._navigation.next(navigation);
      }),
      catchError((error) => {
        console.error('Error al obtener la navegación:', error);
        throw error;
      })
    );
  }

  /**
   * Reload navigation
   */
  reloadNavigation(): void {
    console.log('Iniciando recarga de navegación...');
    const userRole = this._authService.getUserRole();
    console.log('Rol actual del usuario:', userRole);

    if (!userRole) {
      console.log('No hay rol de usuario, omitiendo recarga de navegación');
      return;
    }

    this.get().pipe(
      catchError((error) => {
        console.error('Error al recargar la navegación:', error);
        return [];
      })
    ).subscribe({
      next: () => console.log('Navegación recargada exitosamente'),
      error: (error) => console.error('Error en la suscripción de recarga:', error)
    });
  }

  private adjustNavigationByUserRole(navigation: Navigation): Navigation {
    const userRole = this._authService.getUserRole();
    const userAgency = this._authService.getUserAgency();
    const userPrograms = this._authService.getUserPrograms();

    console.log('Ajustando navegación para:', { userRole, userAgency, userPrograms });

    // Determinar el prefijo de la ruta basado en el rol y programa
    let prefix = this.getRoutePrefix(userRole, userPrograms);

    const adjustLinks = (items: FuseNavigationItem[]): FuseNavigationItem[] => {
      return items
        .filter((item) => {
          const allowed = this.isItemAllowed(item, userRole);
          console.log(`Item ${item.id}: ${allowed ? 'permitido' : 'no permitido'} para rol ${userRole}`);
          return allowed;
        })
        .map((item) => {
          const newItem = { ...item };
          if (newItem.link && !this.isExternalLink(newItem.link)) {
            // Limpiar la ruta antes de agregar el prefijo
            const cleanLink = this.cleanRoute(newItem.link);
            newItem.link = `${prefix}${cleanLink}`;
            console.log(`Ajustando link: ${item.link} -> ${newItem.link}`);
          }
          if (newItem.children) {
            newItem.children = adjustLinks(newItem.children);
          }
          return newItem;
        });
    };

    const result = { ...navigation };

    if (result.default) {
      result.default = adjustLinks(result.default);
    }
    if (result.compact) {
      result.compact = adjustLinks(result.compact);
    }
    if (result.horizontal) {
      result.horizontal = adjustLinks(result.horizontal);
    }

    return result;
  }

  private getRoutePrefix(userRole: string, userPrograms: string): string {
    if (userRole === 'Agency-Administrator' || userRole === 'Agency-User') {
      return '/agency-portal';
    } else if (userRole === 'Monitor' || userRole === 'Monitor-Administrator') {
      return '/monitor-portal';
    }
    return '/admin-portal';
  }

  private cleanRoute(route: string): string {
    // Eliminar prefijos existentes
    const prefixes = ['/admin-portal', '/agency-portal', '/monitor-portal'];
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

  private isItemAllowed(item: FuseNavigationItem, userRole: string): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return item.roles.includes(userRole);
  }
}
