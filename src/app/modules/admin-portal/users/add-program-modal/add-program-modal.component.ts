import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ProgramOption } from '../users.types';

export interface AddProgramModalData {
  userName: string;
  listPrograms: ProgramOption[];
  assignedProgramIds: number[];
}

export interface AddProgramModalResult {
  selectedPrograms: ProgramOption[];
}

@Component({
  selector: 'app-add-program-modal',
  templateUrl: './add-program-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
})
export class AddProgramModalComponent implements OnInit, OnDestroy {
  // -----
  // @ Subject de desuscripción
  // -----
  private _unsubscribeAll: Subject<void> = new Subject<void>();

  // -----
  // @ Inyecciones privadas
  // -----
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService = inject(TranslocoService);
  private _formBuilder = inject(FormBuilder);

  // -----
  // @ Variables
  // -----
  currentLang = 'es';
  availablePrograms: ProgramOption[] = [];
  filteredPrograms: ProgramOption[] = [];
  selectedPrograms: ProgramOption[] = [];
  isInitialLoading = true;
  isLoading = false;
  form: FormGroup = this._formBuilder.group({
    search: new FormControl(''),
  });

  // -----
  // @ Constructor
  // -----
  constructor(
    public dialogRef: MatDialogRef<AddProgramModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddProgramModalData,
  ) {}

  // -----
  // @ Getters
  // -----
  /** Indica si el botón de guardar debe permanecer deshabilitado. */
  get isSubmitDisabled(): boolean {
    return this.selectedPrograms.length === 0 || this.isLoading || this.isInitialLoading;
  }

  // -----
  // @ ngOnInit / ngOnDestroy
  // -----
  /** Inicializa idioma, filtros y lista de programas disponibles en el modal. */
  ngOnInit(): void {
    this.currentLang = this._translocoService.getActiveLang() ?? 'es';
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang) => {
      this.currentLang = lang ?? 'es';
      this._changeDetectorRef.markForCheck();
    });

    this.form.get('search')?.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this._unsubscribeAll))
      .subscribe((searchTerm: string) => {
        this._filterPrograms(searchTerm);
      });

    this._loadAvailablePrograms();
  }

  /** Libera suscripciones activas del componente modal. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----
  // @ Otras funciones públicas
  // -----
  /** Indica si un programa está seleccionado por el usuario. */
  isProgramSelected(program: ProgramOption): boolean {
    return this.selectedPrograms.some((item) => item.id === program.id);
  }

  /** Agrega o quita un programa de la selección actual. */
  toggleProgramSelection(program: ProgramOption): void {
    const index = this.selectedPrograms.findIndex((item) => item.id === program.id);
    if (index > -1) {
      this.selectedPrograms.splice(index, 1);
    } else {
      this.selectedPrograms.push(program);
    }
    this._changeDetectorRef.markForCheck();
  }

  /** Selecciona todos los programas visibles en el filtro actual. */
  selectAll(): void {
    this.filteredPrograms.forEach((program) => {
      if (!this.isProgramSelected(program)) {
        this.selectedPrograms.push(program);
      }
    });
    this._changeDetectorRef.markForCheck();
  }

  /** Limpia completamente la selección de programas del modal. */
  deselectAll(): void {
    this.selectedPrograms = [];
    this._changeDetectorRef.markForCheck();
  }

  /** Cierra el modal devolviendo los programas seleccionados. */
  onSubmit(): void {
    if (this.isSubmitDisabled) return;
    this.isLoading = true;
    this.dialogRef.close({ selectedPrograms: this.selectedPrograms } as AddProgramModalResult);
  }

  /** Cierra el modal sin aplicar cambios. */
  onCancel(): void {
    this.dialogRef.close();
  }

  // -----
  // @ Funciones privadas
  // -----
  /** Inicializa el catálogo disponible excluyendo programas ya asignados al usuario. */
  private _loadAvailablePrograms(): void {
    const assignedIds = new Set(this.data.assignedProgramIds ?? []);
    this.availablePrograms = (this.data.listPrograms ?? []).filter((program) => !assignedIds.has(program.id));
    this.filteredPrograms = [...this.availablePrograms];
    this.isInitialLoading = false;
    this._changeDetectorRef.markForCheck();
  }

  /** Filtra programas por nombre en español o inglés según término de búsqueda. */
  private _filterPrograms(searchTerm?: string): void {
    const value = (searchTerm ?? '').toLowerCase().trim();
    if (!value) {
      this.filteredPrograms = [...this.availablePrograms];
      this._changeDetectorRef.markForCheck();
      return;
    }

    this.filteredPrograms = this.availablePrograms.filter((program) => {
      const name = (program.name ?? '').toLowerCase();
      const nameEN = (program.nameEN ?? '').toLowerCase();
      return name.includes(value) || nameEN.includes(value);
    });
    this._changeDetectorRef.markForCheck();
  }
}
