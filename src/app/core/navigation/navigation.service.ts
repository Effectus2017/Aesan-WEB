import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { FuseNavigationItem } from '@fuse/components/navigation';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private _httpClient = inject(HttpClient);
  private _authService = inject(AuthService);
  private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

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
      map((navigation) => this.adjustNavigationByUserRole(navigation)),
      tap((navigation) => {
        this._navigation.next(navigation);
      })
    );
  }

  private adjustNavigationByUserRole(navigation: Navigation): Navigation {
    const userRole = this._authService.getUserRole();
    const userAgency = this._authService.getUserAgency();
    const userPrograms = this._authService.getUserPrograms();

    // Determinar el prefijo de la ruta basado en el rol y programa
    let prefix = '/admin-portal/';

    if (userRole === 'Agency-Administrator' || userRole === 'Agency-User') {
      prefix = '/agency-portal/';
      // Si es una agencia, usar la navegación específica de agencia
      navigation.default = this.getAgencyNavigation();
      navigation.compact = this.getAgencyNavigation();
    } else {
      // Ajustar el prefijo según el programa para otros roles
      switch (userPrograms) {
        case 'PDAM':
          prefix = '/pdam-portal/';
          break;
        case 'PSAV':
          prefix = '/psav-portal/';
          break;
        case 'PACNA':
          prefix = '/pacna-portal/';
          break;
        case 'PFHF':
          prefix = '/pfhf-portal/';
          break;
        case 'PAF':
          prefix = '/paf-portal/';
          break;
        case 'PDFE':
          prefix = '/pdf-portal/';
          break;
        default:
          prefix = '/admin-portal/';
          break;
      }
    }

    const adjustLinks = (items: FuseNavigationItem[]): FuseNavigationItem[] => {
      return items
        .filter((item) => this.isItemAllowed(item, userRole))
        .map((item) => {
          if (item.link && !item.link.startsWith('/sign-in') && !item.link.startsWith('/sign-up')) {
            item.link = `${prefix}${item.link}`;
          }
          if (item.children) {
            item.children = adjustLinks(item.children);
          }
          return item;
        });
    };

    if (navigation.default) {
      navigation.default = adjustLinks(navigation.default);
    }

    if (navigation.compact) {
      navigation.compact = adjustLinks(navigation.compact);
    }

    return navigation;
  }

  private getAgencyNavigation(): FuseNavigationItem[] {
    return [
      {
        id: 'agency-home',
        title: 'Inicio',
        type: 'basic',
        icon: 'heroicons_outline:home',
        link: 'home'
      },
      {
        id: 'program-requests',
        title: 'Solicitudes al Programa',
        type: 'basic',
        icon: 'heroicons_outline:document-text',
        link: 'program-requests'
      },
      {
        id: 'documents',
        title: 'Documentos',
        type: 'basic',
        icon: 'heroicons_outline:document',
        link: 'documents'
      },
      {
        id: 'budget',
        title: 'Presupuesto',
        type: 'basic',
        icon: 'heroicons_outline:currency-dollar',
        link: 'budget'
      },
      {
        id: 'reimbursements',
        title: 'Reembolsos',
        type: 'basic',
        icon: 'heroicons_outline:receipt-refund',
        link: 'reimbursements'
      }
    ];
  }

  private isItemAllowed(item: FuseNavigationItem, userRole: string): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return item.roles.includes(userRole);
  }
}
