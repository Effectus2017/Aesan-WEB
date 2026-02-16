import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { NgIf } from '@angular/common';
import { fuseAnimations } from '@fuse/animations';
import { RouterLink, RouterModule } from '@angular/router';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from './generic-header.interface';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { DisableIfAgencyRestrictedDirective } from 'app/shared/directives/disable-if-agency-restricted/disable-if-agency-restricted.directive';
import { DisableIfNoPermissionDirective } from 'app/shared/directives/disable-if-no-permission/disable-if-no-permission.directive';
import { KeyboardShortcutDirective } from 'app/shared/directives/keyboard-shortcut.directive';

@Component({
    selector: 'app-generic-header',
    templateUrl: './generic-header.component.html',
    animations: fuseAnimations,
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatTooltipModule, MatMenuModule, NgIf, RouterModule, TranslocoModule, DisableIfAgencyRestrictedDirective, DisableIfNoPermissionDirective, KeyboardShortcutDirective]
})
export class GenericHeaderComponent {
  @Input() config: GenericHeaderConfig;
  @Input() handler: OnGenericHeaderHandlers;

  private _translocoService = inject(TranslocoService);
  private _authService = inject(AuthService);

  // Search Field config
  @Input() searchFieldShow: boolean = false;
  @Input() searchInputPlaceholder: string = 'Search'; // TODO: Change this to the correct translation key

  // Go to Add Button config
  @Input() goToAddButtonShow: boolean = false;

  // Cancel Button config
  @Input() cancelButtonShow: boolean = false;
  @Input() cancelButtonText: string = 'Cancel'; // TODO: Change this to the correct translation key

  // Submit Button config
  @Input() submitButtonShow: boolean = false;
  @Input() submitButtonText: string = 'Create'; // TODO: Change this to the correct translation key
  @Input() submitLoadingText: string = 'Creating...'; // TODO: Change this to the correct translation key

  // Save Button config
  @Input() saveButtonShow: boolean = false;
  @Input() saveButtonText: string = 'Save'; // TODO: Change this to the correct translation key

  // Upload Button config
  @Input() uploadButtonShow: boolean = false;
  @Input() uploadButtonText: string = 'Upload'; // TODO: Change this to the correct translation key
  @Input() uploadButtonColor: string = 'primary';
  @Input() uploadButtonClass: string = '';
  @Input() uploadButtonDisabled: boolean = false;



  // Clear Button config
  @Input() clearVisible: boolean = false;

  // Loading config
  @Input() isLoading: boolean = false;

  /**
   * Verifica si un botón debe estar deshabilitado por permisos
   * @param permission Permiso requerido para el botón
   * @param isManuallyDisabled Si el botón está deshabilitado manualmente
   * @returns true si el botón debe estar deshabilitado
   */
  isButtonDisabledByPermission(permission?: string, isManuallyDisabled: boolean = false): boolean {
    // Si está deshabilitado manualmente, retornar true
    if (isManuallyDisabled) {
      return true;
    }

    // Si tiene permiso definido, verificar si el usuario lo tiene
    if (permission) {
      return !this._authService.hasPermission(permission);
    }

    // Si no tiene permiso definido, el botón está habilitado
    return false;
  }

  /**
   * Obtiene el tooltip para un botón del header
   * @param tooltipKey Clave de traducción del tooltip
   * @param disabledTooltipKey Clave de traducción del tooltip deshabilitado
   * @param permission Permiso requerido para el botón
   * @param isManuallyDisabled Si el botón está deshabilitado manualmente
   * @returns El mensaje del tooltip apropiado
   */
  getButtonTooltip(tooltipKey?: string, disabledTooltipKey?: string, permission?: string, isManuallyDisabled: boolean = false): string | undefined {
    const isDisabled = this.isButtonDisabledByPermission(permission, isManuallyDisabled);

    // Si está deshabilitado y tiene tooltip para deshabilitado, usarlo
    if (isDisabled && disabledTooltipKey) {
      return this._translocoService.translate(disabledTooltipKey);
    }

    // Si está deshabilitado por permisos y no tiene tooltip específico, usar genérico
    if (isDisabled && permission && !this._authService.hasPermission(permission)) {
      return this._translocoService.translate('global.tooltips.noPermission');
    }

    // Si está habilitado y tiene tooltip normal, usarlo
    if (!isDisabled && tooltipKey) {
      return this._translocoService.translate(tooltipKey);
    }

    return undefined;
  }

  onSubmit() {
    this.handler.onSubmit();
  }

  onCancel(event: Event) {
    this.handler.onCancel(event);
  }

  onSave() {
    if (this.handler?.onSave) {
      this.handler.onSave();
    }
  }

  onReject() {
    this.handler.onReject();
  }

  onSearch() {
    this.handler.onSearch();
  }

  onClean(event: Event) {
    this.handler.onClean(event);
  }

  onCustom() {
    this.handler.onCustom();
  }

  //
  onHeaderUploadFile(event: Event) {
    this.handler.onHeaderUploadFile(event);
  }

  onSettingsMenuAction(menuItemId: string): void {
    if (this.handler.onSettingsMenuAction) {
      this.handler.onSettingsMenuAction(menuItemId);
    }
  }

  onAdd() {
    if (this.handler.onAdd) {
      this.handler.onAdd();
    }
  }
}
