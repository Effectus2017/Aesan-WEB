import { NgIf } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { AuthService } from 'app/core/auth/auth.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { RouteStyleService } from 'app/shared/services/route-style.service';
import { UserComponent } from 'app/layout/common/user/user.component';
import { MessagesComponent } from 'app/layout/common/messages/messages.component';
import { ThemeToggleComponent } from 'app/shared/components/theme-toggle/theme-toggle.component';
import { DeadlineBannerComponent } from 'app/shared/components/deadline-banner/deadline-banner.component';
import { CurrentProgramBannerComponent } from 'app/shared/components/current-program-banner/current-program-banner.component';
import { AgencyStatusBannerComponent } from 'app/shared/components/agency-status-banner/agency-status-banner.component';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'compact-layout',
    templateUrl: './compact.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        FuseLoadingBarComponent,
        MatButtonModule,
        MatIconModule,
        LanguagesComponent,
        UserComponent,
        NgIf,
        RouterOutlet,
        FuseVerticalNavigationComponent,
        ThemeToggleComponent,
        DeadlineBannerComponent,
        CurrentProgramBannerComponent,
        AgencyStatusBannerComponent,
        MessagesComponent
    ]
})
export class CompactLayoutComponent implements OnInit, OnDestroy {
  isScreenSmall: boolean;
  navigation: Navigation;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  currentRoute: string;
  backgroundClass: string;
  logoPath: string;

  // Propiedades para controlar la visibilidad de los banners
  showCurrentProgramBanner: boolean = true;
  showAgencyStatusBanner: boolean = true;
  showDeadlineBanner: boolean = true;

  private _authService = inject(AuthService);
  private _agencyService = inject(AgencyService);
  private _routeStyleService = inject(RouteStyleService);
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _navigationService = inject(NavigationService);
  private _fuseMediaWatcherService = inject(FuseMediaWatcherService);
  private _fuseNavigationService = inject(FuseNavigationService);

  /**
   * Constructor
   */
  constructor() {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for current year
   */
  get currentYear(): number {
    return new Date().getFullYear();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe to navigation data
    this._navigationService.navigation$.pipe(takeUntil(this._unsubscribeAll)).subscribe((navigation: Navigation) => {
      this.navigation = navigation;
    });

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$.pipe(takeUntil(this._unsubscribeAll)).subscribe(({ matchingAliases }) => {
      // Check if the screen is small
      this.isScreenSmall = !matchingAliases.includes('md');
    });

    // Suscribirse a los cambios de ruta
    this._router.events.pipe(filter(event => event instanceof NavigationEnd),takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.updateRouteStyles();
    });

    // Inicializar estilos
    this.updateRouteStyles();

    // Verificar si los banners deben mostrarse
    console.log('Compact Layout - ngOnInit - calling checkBannerVisibility');
    this.checkBannerVisibility();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle navigation
   *
   * @param name
   */
  toggleNavigation(name: string): void {
    // Get the navigation
    const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

    if (navigation) {
      // Toggle the opened status
      navigation.toggle();
    }
  }

  private updateRouteStyles(): void {
    const rootRoute = this._activatedRoute.snapshot.root;
    const childRoutes = rootRoute.children;

    if (childRoutes.length > 0) {
      this.currentRoute = childRoutes[0].routeConfig.path;
      const { backgroundClass, logoPath } = this._routeStyleService.updateRouteStyles();
      this.backgroundClass = backgroundClass;
      this.logoPath = logoPath;
    } else {
      const { backgroundClass, logoPath } = this._routeStyleService.updateRouteStyles();
      this.backgroundClass = backgroundClass;
      this.logoPath = logoPath;
    }
  }

  /**
   * Verifica si los banners deben mostrarse basado en el rol del usuario y la agencia
   */
  private checkBannerVisibility(): void {
    console.log('Compact Layout - checkBannerVisibility called');

    // Verificar si el usuario es administrador o monitor
    const userRole = this._authService.getUserRole();
    const isAdmin = userRole === 'Administrator' || userRole === 'Admin';
    const isMonitor = userRole === 'Monitor';

    console.log('Compact Layout - User role:', userRole, 'Is admin:', isAdmin, 'Is monitor:', isMonitor);

    // Si es administrador o monitor, ocultar todos los banners
    if (isAdmin || isMonitor) {
      console.log('Compact Layout - Hiding all banners for admin/monitor user');
      this.showCurrentProgramBanner = false;
      this.showAgencyStatusBanner = false;
      this.showDeadlineBanner = false;
      console.log('Compact Layout - Banner visibility after admin/monitor check:', {
        showCurrentProgramBanner: this.showCurrentProgramBanner,
        showAgencyStatusBanner: this.showAgencyStatusBanner,
        showDeadlineBanner: this.showDeadlineBanner
      });
      return;
    }

    // Verificar si la agencia es NUTRE
    this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      console.log('Compact Layout - Agency service result:', result);

      if (result && result.body) {
        const agency = result.body;
        const isNutreAgency = agency && (
          agency.id === 1 ||
          agency.id === '1' ||
          agency.id == 1 ||
          (agency.name && agency.name.toLowerCase() === 'nutre')
        );

        console.log('Compact Layout - Agency data:', agency);
        console.log('Compact Layout - Is NUTRE agency:', isNutreAgency);

        if (isNutreAgency) {
          console.log('Compact Layout - Hiding all banners for NUTRE agency');
          this.showCurrentProgramBanner = false;
          this.showAgencyStatusBanner = false;
          this.showDeadlineBanner = false;
        } else {
          console.log('Compact Layout - Showing all banners for non-NUTRE agency');
          this.showCurrentProgramBanner = true;
          this.showAgencyStatusBanner = true;
          this.showDeadlineBanner = true;
        }

        console.log('Compact Layout - Final banner visibility:', {
          showCurrentProgramBanner: this.showCurrentProgramBanner,
          showAgencyStatusBanner: this.showAgencyStatusBanner,
          showDeadlineBanner: this.showDeadlineBanner
        });
      }
    });
  }
}
