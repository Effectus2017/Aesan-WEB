import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { TemplateVariableService } from 'app/shared/services/template-variable.service';
import { TemplateVariable } from 'app/shared/models/TemplateVariable';
import { copyToClipboard } from 'app/shared/utils';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-template-variables',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslocoModule,
    MatSnackBarModule,
  ],
  templateUrl: './template-variables.component.html',
  styleUrls: ['./template-variables.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TemplateVariablesComponent implements OnInit, OnDestroy {
  private _templateVariableService = inject(TemplateVariableService);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  variables: TemplateVariable[] = [];
  variablesByCategory: { [key: string]: TemplateVariable[] } = {};
  categories: string[] = [];
  isLoading: boolean = true;

  ngOnInit(): void {
    const resolvedData = this._route.snapshot.data['data'];
    if (resolvedData && resolvedData.variables) {
      this.variables = resolvedData.variables;
      this.organizeByCategory();
      this.isLoading = false;
      this._cdr.markForCheck();
    } else {
      this.loadVariables();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadVariables(): void {
    this.isLoading = true;
    this._templateVariableService.getAllTemplateVariables()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (variables) => {
          this.variables = variables;
          this.organizeByCategory();
          this.isLoading = false;
          this._cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error al cargar variables:', error);
          this.isLoading = false;
          this._cdr.markForCheck();
        }
      });
  }

  organizeByCategory(): void {
    this.variablesByCategory = {};
    this.variables.forEach(variable => {
      if (!this.variablesByCategory[variable.category]) {
        this.variablesByCategory[variable.category] = [];
      }
      this.variablesByCategory[variable.category].push(variable);
    });
    this.categories = Object.keys(this.variablesByCategory).sort();
  }

  async copyVariable(variable: TemplateVariable): Promise<void> {
    const success = await copyToClipboard(variable.displayName);
    if (success) {
      const message = this._transloco.translate('template-variables.modal.copied', { variable: variable.displayName });
      this._snackBar.open(message, this._transloco.translate('global.buttons.close'), {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } else {
      const message = this._transloco.translate('template-variables.modal.copyError');
      this._snackBar.open(message, this._transloco.translate('global.buttons.close'), {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  }

  goBack(): void {
    this._router.navigate(['/message-template']);
  }

  getDescription(variable: TemplateVariable): string {
    const currentLang = this._transloco.getActiveLang();
    return currentLang === 'es' ? variable.descriptionES : variable.descriptionEN;
  }

  getExample(variable: TemplateVariable): string {
    const currentLang = this._transloco.getActiveLang();
    return currentLang === 'es' ? variable.exampleES : variable.exampleEN;
  }
}

