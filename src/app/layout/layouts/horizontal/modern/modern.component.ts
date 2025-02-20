import { NgIf } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { FuseHorizontalNavigationComponent, FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { RouteStyleService } from 'app/shared/services/route-style.service';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'modern-layout',
  templateUrl: './modern.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    FuseLoadingBarComponent,
    NgIf,
    FuseVerticalNavigationComponent,
    FuseHorizontalNavigationComponent,
    MatButtonModule,
    MatIconModule,
    LanguagesComponent,
    UserComponent,
    RouterOutlet
  ],
})
export class ModernLayoutComponent implements OnInit, OnDestroy {
  isScreenSmall: boolean;
  navigation: Navigation;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  backgroundClass: string;
  logoPath: string;

  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _navigationService = inject(NavigationService);
  private _fuseMediaWatcherService = inject(FuseMediaWatcherService);
  private _fuseNavigationService = inject(FuseNavigationService);
  private _routeStyleService = inject(RouteStyleService);

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
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        this.updateRouteStyles();
      });

    // Inicializar estilos
    this.updateRouteStyles();
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
      const { backgroundClass, logoPath } = this._routeStyleService.updateRouteStyles();
      this.backgroundClass = backgroundClass;
      this.logoPath = logoPath;
    } else {
      const { backgroundClass, logoPath } = this._routeStyleService.updateRouteStyles();
      this.backgroundClass = backgroundClass;
      this.logoPath = logoPath;
    }
  }
}
