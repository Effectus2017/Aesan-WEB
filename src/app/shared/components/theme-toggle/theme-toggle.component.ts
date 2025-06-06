import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfigService } from '@fuse/services/config';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'theme-toggle',
    templateUrl: './theme-toggle.component.html',
    styleUrls: ['./theme-toggle.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'themeToggle',
    imports: [MatButtonModule, MatIconModule, MatTooltipModule, CommonModule]
})
export class ThemeToggleComponent implements OnInit {
  @Input() menuItem: boolean = false;
  isDarkMode: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(private _fuseConfigService: FuseConfigService) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Suscribirse a los cambios de configuración
    this._fuseConfigService.config$.pipe(takeUntil(this._unsubscribeAll)).subscribe((config) => {
      this.isDarkMode = config.scheme === 'dark';
      // Guardar el tema en localStorage
      localStorage.setItem('theme', config.scheme);
    });
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
   * Toggle the theme
   */
  toggleTheme(): void {
    const newTheme = this.isDarkMode ? 'light' : 'dark';
    this._fuseConfigService.config = { scheme: newTheme };
    // Guardar el nuevo tema en localStorage
    localStorage.setItem('theme', newTheme);
  }
}
