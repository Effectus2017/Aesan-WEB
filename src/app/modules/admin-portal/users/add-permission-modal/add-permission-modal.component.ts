import { Component, Inject, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject } from 'rxjs';
import { forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { PermissionService } from 'app/shared/services/permission.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { Permission } from 'app/shared/models/Permission';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';

@Component({
  selector: 'app-add-permission-modal',
  templateUrl: './add-permission-modal.component.html',
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
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: fadeIn 2.0s ease-out;
    }
  `]
})
export class AddPermissionModalComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _permissionService = inject(PermissionService);
  private _formBuilder = inject(FormBuilder);

  // Lists for selects
  listPermissions: Permission[] = [];
  userPermissions: Permission[] = [];
  filteredPermissions: Permission[] = [];
  selectedPermissions: Permission[] = [];

  // Language support
  currentLang: string = 'es';

  form: FormGroup = this._formBuilder.group({
    search: new FormControl(''),
  });

  // Loading states
  isLoading: boolean = false; // Para el submit
  isInitialLoading: boolean = true; // Para la carga inicial

  constructor(
    public dialogRef: MatDialogRef<AddPermissionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      userId: string;
      userName: string;
    },
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios de idioma
    this._translocoService.langChanges$.subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Suscribirse a cambios en el campo de búsqueda
    this.form.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((searchTerm: string) => {
        this.filterPermissions(searchTerm);
      });

    this.onLoadInitialData();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onLoadInitialData(): void {
    this.isInitialLoading = true;

    const permissionsQueryParams: QueryParameters = {
      take: 100,
      skip: 0,
      name: null,
      alls: true,
    };

    const userPermissionsQueryParams: QueryParameters = {
      userId: this.data.userId,
    };

    // Ejecutar ambas requests en paralelo usando forkJoin
    forkJoin({
      permissions: this._permissionService.getAllPermissionsFromDb(permissionsQueryParams),
      userPermissions: this._permissionService.getUserPermissions(userPermissionsQueryParams)
    }).subscribe({
      next: (response) => {
        // Procesar respuesta de permisos
        if (!isNullOrUndefinedEmptyStringNullArray(response.permissions)) {
          this.listPermissions = response.permissions.body.data;
        }

        // Procesar respuesta de permisos del usuario
        if (!isNullOrUndefinedEmptyStringNullArray(response.userPermissions)) {
          this.userPermissions = response.userPermissions.body.data;

          // Filtrar permisos ya asignados al usuario
          const assignedPermissionIds = this.userPermissions.map(p => p.id);
          this.listPermissions = this.listPermissions.filter(p => !assignedPermissionIds.includes(p.id));
        }

        // Inicializar permisos filtrados
        this.filteredPermissions = [...this.listPermissions];

        this.isInitialLoading = false;
        this._changeDetectorRef.detectChanges();
      },
      error: (error) => {
        this.isInitialLoading = false;
        this._notificationService.showErrorDialog(this._translocoService.translate('users.permission.modal.error.loadingData'));
      },
      complete: () => {
        this.isInitialLoading = false;
      }
    });
  }

  /**
   * Filtra los permisos basado en el término de búsqueda
   */
  filterPermissions(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredPermissions = [...this.listPermissions];
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.filteredPermissions = this.listPermissions.filter(permission =>
        permission.name.toLowerCase().includes(term) ||
        permission.valueKey.toLowerCase().includes(term) ||
        (permission.nameEn && permission.nameEn.toLowerCase().includes(term))
      );
    }
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Verifica si un permiso está seleccionado
   */
  isPermissionSelected(permission: Permission): boolean {
    return this.selectedPermissions.some(p => p.id === permission.id);
  }

  /**
   * Alterna la selección de un permiso
   */
  togglePermissionSelection(permission: Permission): void {
    const index = this.selectedPermissions.findIndex(p => p.id === permission.id);
    if (index > -1) {
      this.selectedPermissions.splice(index, 1);
    } else {
      this.selectedPermissions.push(permission);
    }
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Selecciona todos los permisos filtrados
   */
  selectAll(): void {
    this.filteredPermissions.forEach(permission => {
      if (!this.isPermissionSelected(permission)) {
        this.selectedPermissions.push(permission);
      }
    });
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Deselecciona todos los permisos
   */
  deselectAll(): void {
    this.selectedPermissions = [];
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.selectedPermissions.length === 0) {
      return;
    }

    this.isLoading = true;

    // Asignar múltiples permisos usando forkJoin
    const requests = this.selectedPermissions.map(permission => {
      const requestParameters: QueryParameters = {
        userId: this.data.userId,
        permissionId: permission.id,
      };
      return this._permissionService.assignPermissionToUser(requestParameters);
    });

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        const successCount = results.filter(result => result.status === 200).length;
        if (successCount === this.selectedPermissions.length) {
          this._notificationService.showSuccessDialog(
            this._translocoService.translate('users.permission.modal.success.multipleAssigned', { count: successCount })
          );
          this.dialogRef.close({ success: true, permissions: this.selectedPermissions });
        } else {
          this._notificationService.showErrorDialog(this._translocoService.translate('users.permission.modal.error.assign'));
        }
      },
      error: (error) => {
        this._notificationService.showErrorDialog(this._translocoService.translate('users.permission.modal.error.assign'));
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Cierra el modal sin guardar cambios
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
