import { Component, Inject, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TemplateVariableService } from 'app/shared/services/template-variable.service';
import { TemplateVariable } from 'app/shared/models/TemplateVariable';
import { copyToClipboard } from 'app/shared/utils';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

export interface TemplateVariablesModalData {
  // No se necesitan datos adicionales por ahora
}

@Component({
  selector: 'app-template-variables-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslocoModule,
    MatSnackBarModule,
  ],
  templateUrl: './template-variables-modal.component.html',
  styleUrls: ['./template-variables-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TemplateVariablesModalComponent implements OnInit, OnDestroy {
  private _templateVariableService = inject(TemplateVariableService);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['displayName', 'description', 'category', 'example', 'actions'];
  dataSource = new MatTableDataSource<TemplateVariable>([]);
  allVariables: TemplateVariable[] = [];
  filteredVariables: TemplateVariable[] = [];
  
  searchText: string = '';
  selectedCategory: string = 'all';
  categories: string[] = ['all'];
  
  isLoading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<TemplateVariablesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TemplateVariablesModalData
  ) {}

  ngOnInit(): void {
    this.loadVariables();
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
          this.allVariables = variables;
          this.filteredVariables = variables;
          this.dataSource.data = variables;
          
          // Extraer categorías únicas
          const uniqueCategories = [...new Set(variables.map(v => v.category))];
          this.categories = ['all', ...uniqueCategories.sort()];
          
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

  applyFilter(): void {
    let filtered = [...this.allVariables];

    // Filtrar por categoría
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(v => v.category === this.selectedCategory);
    }

    // Filtrar por búsqueda
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(v => 
        v.key.toLowerCase().includes(searchLower) ||
        v.displayName.toLowerCase().includes(searchLower) ||
        v.descriptionES.toLowerCase().includes(searchLower) ||
        v.descriptionEN.toLowerCase().includes(searchLower) ||
        v.category.toLowerCase().includes(searchLower)
      );
    }

    this.filteredVariables = filtered;
    this.dataSource.data = filtered;
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  onCategoryChange(): void {
    this.applyFilter();
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

  openDocumentationPage(): void {
    this.dialogRef.close();
    this._router.navigate(['/message-template/variables']);
  }

  close(): void {
    this.dialogRef.close();
  }

  getDescription(variable: TemplateVariable): string {
    const currentLang = this._transloco.getActiveLang();
    return currentLang === 'en' ? variable.descriptionEN : variable.descriptionES;
  }

  getExample(variable: TemplateVariable): string {
    const currentLang = this._transloco.getActiveLang();
    return currentLang === 'en' ? variable.exampleEN : variable.exampleES;
  }
}

