import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { catchError, distinctUntilChanged, map, Observable, ReplaySubject, Subject, takeUntil, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { UserService } from 'app/shared/services/user.service';
import { Agency } from 'app/shared/models/Agency';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { PROGRAM_IDS } from 'app/shared/const';

@Injectable({ providedIn: 'root' })
export class NavigationService implements OnDestroy {
  private _httpClient = inject(HttpClient);
  private _authService = inject(AuthService);
  private _userService = inject(UserService);
  private _optionSelectionService = inject(OptionSelectionService);
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
   * Ajusta el menú de sitios basado en IsDayCareHomeId de la agencia
   * Este método debe ser llamado después de obtener la agencia y las opciones
   */
  adjustSitesMenuForAgency(navigation: Navigation, agency: Agency, isDayCareHomeOptions: any[]): Navigation {
    // PRIMERO: Verificar si la agencia tiene el programa PACNA
    const hasPACNA = agency?.programs?.some((program) => program?.id === PROGRAM_IDS.PACNA) ?? false;

    // Si no tiene PACNA, retornar navegación sin cambios
    if (!hasPACNA) {
      console.log('[NavigationService] Agencia no tiene PACNA, no se ajusta el menú');
      return navigation;
    }

    const isDayCareHome = agency?.inscription?.isDayCareHome;

    // Si no hay isDayCareHome o no hay opciones disponibles, retornar navegación sin cambios
    // Asegurar que isDayCareHomeOptions sea un array
    if (!isDayCareHome || !isDayCareHomeOptions || !Array.isArray(isDayCareHomeOptions) || isDayCareHomeOptions.length === 0) {
      console.log('[NavigationService] No hay isDayCareHome o opciones disponibles', { isDayCareHome, isDayCareHomeOptions });
      return navigation;
    }

    // Buscar las opciones usando solo booleanValue (independiente del idioma)
    const noOption = isDayCareHomeOptions.find((opt: any) => opt.booleanValue === false);
    const siOption = isDayCareHomeOptions.find((opt: any) => opt.booleanValue === true);
    const ambosOption = isDayCareHomeOptions.find((opt: any) => opt.booleanValue == null);

    // Verificar el valor actual de isDayCareHome usando solo booleanValue
    const isNo = isDayCareHome.booleanValue === false;
    const isSi = isDayCareHome.booleanValue === true;
    const isAmbos = isDayCareHome.booleanValue == null;

    console.log('[NavigationService] Ajustando menú de sitios', {
      hasPACNA,
      isDayCareHome: isDayCareHome.booleanValue,
      isNo,
      isSi,
      isAmbos,
      noOptionId: noOption?.id,
      siOptionId: siOption?.id
    });

    const adjustedNavigation = { ...navigation };
    const userRole = this._authService.getUserRole();
    const userPermissions = this._authService.getUserPermissions?.() || [];

    // Re-aplicar ajustes de rutas y permisos primero
    if (adjustedNavigation.default) {
      adjustedNavigation.default = this.adjustLinks(adjustedNavigation.default, userRole, userPermissions);
    }
    if (adjustedNavigation.horizontal) {
      adjustedNavigation.horizontal = this.adjustLinks(adjustedNavigation.horizontal, userRole, userPermissions);
    }

    // Luego aplicar los ajustes específicos de isDayCareHome (después de adjustLinks para que no se sobrescriban)
    if (isAmbos && noOption && siOption) {
      // Si es "Ambos", convertir a group con children
      this.convertSitesToGroupMenu(adjustedNavigation, noOption.id, siOption.id, userRole, userPermissions);
    } else if (isNo) {
      // Si es "No", cambiar título a "Centros" y agregar queryParam
      // Usar el ID de isDayCareHome directamente si noOption no se encuentra
      const noOptionId = noOption?.id || isDayCareHome.id;
      console.log('[NavigationService] Ajustando a Centros con isDayCareHomeId:', noOptionId);
      this.adjustSitesMenuItem(adjustedNavigation, 'navigation.sites.centers', noOptionId);
    } else if (isSi) {
      // Si es "Sí", cambiar título a "Hogares" y agregar queryParam
      // Usar el ID de isDayCareHome directamente si siOption no se encuentra
      const siOptionId = siOption?.id || isDayCareHome.id;
      console.log('[NavigationService] Ajustando a Hogares con isDayCareHomeId:', siOptionId);
      this.adjustSitesMenuItem(adjustedNavigation, 'navigation.sites.homes', siOptionId);
    } else {
      console.log('[NavigationService] No se aplicó ningún ajuste (caso no contemplado)');
    }

    // Actualizar el subject de navegación
    this._navigation.next(adjustedNavigation);
    return adjustedNavigation;
  }

  /**
   * Ajusta un ítem de menú "sites" individual (para casos "No" y "Sí")
   */
  private adjustSitesMenuItem(navigation: Navigation, newTitle: string, isDayCareHomeId: number): void {
    const adjustItem = (items: FuseNavigationItem[]): void => {
      items.forEach(item => {
        // Buscar por ID 'sites' o 'schools' o por link que contenga '/sites' o '/schools'
        const isSitesItem = (item.id === 'sites' || item.id === 'schools') ||
                           (item.link && (item.link.includes('/sites') || item.link.includes('/schools') || item.link.endsWith('/sites') || item.link.endsWith('/schools')));

        if (isSitesItem && item.type === 'basic') {
          console.log('[NavigationService] Encontrado ítem de sitios:', {
            id: item.id,
            link: item.link,
            title: item.title,
            newTitle
          });
          // Modificar directamente el objeto (ya fue procesado por adjustLinks)
          item.title = newTitle;
          // Si el link es '/schools', cambiarlo a '/sites'
          if (item.link && (item.link.includes('/schools') || item.link.endsWith('/schools'))) {
            // Reemplazar '/schools' por '/sites' en el link
            item.link = item.link.replace('/schools', '/sites');
            console.log('[NavigationService] Link actualizado de /schools a /sites:', item.link);
          }
          // Preservar queryParams existentes si los hay, o crear nuevos
          item.queryParams = { ...(item.queryParams || {}), isDayCareHomeId: isDayCareHomeId };
          console.log('[NavigationService] Ítem actualizado:', {
            id: item.id,
            link: item.link,
            title: item.title,
            queryParams: item.queryParams
          });
        }
        if (item.children) {
          adjustItem(item.children);
        }
      });
    };

    if (navigation.default) {
      adjustItem(navigation.default);
    }
    if (navigation.horizontal) {
      adjustItem(navigation.horizontal);
    }
  }

  /**
   * Convierte el ítem "sites" de basic a group con children
   */
  private convertSitesToGroupMenu(
    navigation: Navigation,
    noOptionId: number,
    siOptionId: number,
    userRole: string,
    userPermissions: string[]
  ): void {
    const adjustItem = (items: FuseNavigationItem[]): void => {
      items.forEach(item => {
        // Buscar por ID 'sites' o 'schools' o por link que contenga '/sites' o '/schools'
        const isSitesItem = (item.id === 'sites' || item.id === 'schools') ||
                           (item.link && (item.link.includes('/sites') || item.link.includes('/schools') || item.link.endsWith('/sites') || item.link.endsWith('/schools')));

        if (isSitesItem && item.type === 'basic') {
          item.type = 'group';
          item.link = undefined; // Remover el link del grupo
          item.children = [
            {
              id: 'sites.centers',
              title: 'navigation.sites.centers',
              type: 'basic',
              icon: 'heroicons_solid:academic-cap',
              link: '/sites',
              queryParams: { isDayCareHomeId: noOptionId },
              roles: item.roles,
              permissions: item.permissions,
            },
            {
              id: 'sites.homes',
              title: 'navigation.sites.homes',
              type: 'basic',
              icon: 'heroicons_solid:home',
              link: '/sites',
              queryParams: { isDayCareHomeId: siOptionId },
              roles: item.roles,
              permissions: item.permissions,
            }
          ];
          item.children = this.adjustLinks(item.children, userRole, userPermissions);
        }
        if (item.children) {
          adjustItem(item.children);
        }
      });
    };

    if (navigation.default) {
      adjustItem(navigation.default);
    }
    if (navigation.horizontal) {
      adjustItem(navigation.horizontal);
    }
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
      catchError((error) => {
        return [];
      })
    ).subscribe({
      next: () => console.log('Navegación recargada exitosamente'),
      error: (error) => console.error('Error en la suscripción de recarga:', error)
    });
  }

  private adjustNavigationByUserRole(navigation: Navigation): Navigation {
    const userRole = this._authService.getUserRole();
    const userPermissions = this._authService.getUserPermissions?.() || [];

    let nav: FuseNavigationItem[] = [];
    if (userRole === 'Administrator') {
      nav = navigation.admin ?? [];
    } else if (userRole === 'Agency-Administrator' || userRole === 'Agency-User') {
      nav = navigation.agency ?? [];
    } else if (userRole === 'Monitor' || userRole === 'Monitor-Administrator') {
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
    if (userRole === 'Agency-Administrator' || userRole === 'Agency-User') {
      return '/agency-portal';
    } else if (userRole === 'Monitor' || userRole === 'Monitor-Administrator') {
      return '/aesan-portal';
    }
    return '/admin-portal';
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

  private isItemAllowed(item: FuseNavigationItem, userRole: string): boolean {
    // Si no hay restricciones, mostrar
    if ((!item.roles || item.roles.length === 0) && (!item.permissions || item.permissions.length === 0)) {
      return true;
    }

    // Validar por rol
    if (item.roles && item.roles.length > 0 && item.roles.includes(userRole)) {
      return true;
    }

    // Validar por permisos
    if (item.permissions && item.permissions.length > 0) {
      const userPermissions = this._authService.getUserPermissions?.() || [];
      return item.permissions.some((perm) => userPermissions.includes(perm));
    }

    return false;
  }

  private isItemAllowedByPermissions(item: FuseNavigationItem, userPermissions: string[]): boolean {
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }
    return item.permissions.some((perm) => userPermissions.includes(perm));
  }

  private isItemAllowedByRole(item: FuseNavigationItem, userRole: string): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return item.roles.includes(userRole);
  }
}
