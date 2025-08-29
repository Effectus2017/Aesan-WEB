import { NgFor, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';
import { take } from 'rxjs';

@Component({
    selector: 'languages',
    templateUrl: './languages.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'languages',
    imports: [MatButtonModule, MatMenuModule, NgTemplateOutlet, NgFor]
})
export class LanguagesComponent implements OnInit, OnDestroy {
  availableLangs: AvailableLangs;
  activeLang: string;
  flagCodes: any;

  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private _fuseNavigationService: FuseNavigationService = inject(FuseNavigationService);
  private _translocoService: TranslocoService = inject(TranslocoService);

  /**
   * Constructor
   */
  constructor() {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Initialize flagCodes first to prevent template errors
    this.flagCodes = {
      en: 'us',
      es: 'pr',
    };

    // Get the available languages from transloco
    this.availableLangs = this._translocoService.getAvailableLangs();

    // Get the saved language from localStorage or use 'en' as default
    const savedLang = localStorage.getItem('language') || 'en';

    // Initialize activeLang immediately to prevent undefined errors
    this.activeLang = savedLang;

    this._translocoService.setActiveLang(savedLang);

    // Subscribe to language changes
    this._translocoService.langChanges$.subscribe((activeLang) => {
      // Get the active lang
      this.activeLang = activeLang;
      // Save the selected language in localStorage
      localStorage.setItem('language', activeLang);

      // Update the navigation
      this._updateNavigation(activeLang);
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Set the active lang
   *
   * @param lang
   */
  setActiveLang(lang: string): void {
    // Validate lang parameter
    if (!lang || typeof lang !== 'string') {
      lang = 'en';
    }

    // Set the active lang
    this._translocoService.setActiveLang(lang);
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    // Validate item and item.id
    if (!item || !item.id) {
      return index;
    }

    return item.id;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Update the navigation
   *
   * @param lang
   * @private
   */
  private _updateNavigation(lang: string): void {
    // For the demonstration purposes, we will only update the Dashboard names
    // from the navigation but you can do a full swap and change the entire
    // navigation data.
    //
    // You can import the data from a file or request it from your backend,
    // it's up to you.

    // Get the component -> navigation data -> item
    const navComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');

    // Return if the navigation component does not exist
    if (!navComponent) {
      return null;
    }

    // Get the flat navigation data
    const navigation = navComponent.navigation;

    // Get the Analytics dashboard item and update its title
    const analyticsDashboardItem = this._fuseNavigationService.getItem('side-menu.analytics', navigation);
    if (analyticsDashboardItem) {
      this._translocoService
        .selectTranslate('Analytics')
        .pipe(take(1))
        .subscribe((translation) => {
          // Set the title
          analyticsDashboardItem.title = translation;

          // Refresh the navigation component
          navComponent.refresh();
        });
    }
  }
}
