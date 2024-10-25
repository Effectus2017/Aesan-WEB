import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MessagesComponent } from 'app/layout/common/messages/messages.component';
import { NotificationsComponent } from 'app/layout/common/notifications/notifications.component';
import { QuickChatComponent } from 'app/layout/common/quick-chat/quick-chat.component';
import { SearchComponent } from 'app/layout/common/search/search.component';
import { ShortcutsComponent } from 'app/layout/common/shortcuts/shortcuts.component';
import { ThemeToggleComponent } from 'app/layout/common/theme-toggle/theme-toggle.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'compact-layout',
  templateUrl: './compact.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    FuseLoadingBarComponent,
    MatButtonModule,
    MatIconModule,
    LanguagesComponent,
    FuseFullscreenComponent,
    SearchComponent,
    ShortcutsComponent,
    MessagesComponent,
    NotificationsComponent,
    UserComponent,
    NgIf,
    RouterOutlet,
    QuickChatComponent,
    FuseVerticalNavigationComponent,
    ThemeToggleComponent
  ],
})
export class CompactLayoutComponent implements OnInit, OnDestroy {
  isScreenSmall: boolean;
  navigation: Navigation;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  currentRoute: string;
  backgroundClass: string;
  logoPath: string;

  /**
   * Constructor
   */
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _navigationService: NavigationService,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseNavigationService: FuseNavigationService
  ) {}

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
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this._unsubscribeAll)
    ).subscribe(() => {
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
      this.currentRoute = childRoutes[0].routeConfig.path;

      switch (this.currentRoute) {
        case 'pacna-portal':
          this.backgroundClass = 'bg-[#F8B100]';
          this.logoPath = 'assets/images/logo/pacna-150x150.png';
          break;
        case 'psav-portal':
          this.backgroundClass = 'bg-[#F26B1E]';
          this.logoPath = 'assets/images/logo/psav-150x150.png';
          break;
        case 'pdam-portal':
          this.backgroundClass = 'bg-[#4C3152]';
          this.logoPath = 'assets/images/logo/pdam-150x150.png';
          break;
        case 'pfhf-portal':
          this.backgroundClass = 'bg-[#28AF66]';
          this.logoPath = 'assets/images/logo/pfhf-150x150.png';
          break;
        case 'finca-portal':
          this.backgroundClass = 'bg-[#2A788A]';
          this.logoPath = 'assets/images/logo/finca-150x150.png';
          break;
        default:
          this.backgroundClass = 'bg-[#003C49]';
          this.logoPath = 'assets/images/logo/aesan.png';
      }
    }
  }
}
