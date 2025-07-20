import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { EmployeeService } from 'app/shared/services/employee.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { EmployeeRequest } from 'app/shared/models/Request/EmployeeRequest';

@Component({
  selector: 'app-employee-add',
  templateUrl: './add.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    // Imports necesarios para el componente
  ]
})
export class AddEmployeeComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _employeeService = inject(EmployeeService);
  private _customRouterService = inject(CustomRouterService);
  private _notificationService = inject(NotificationService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  headerConfig: GenericHeaderConfig = {
    title: 'employees.add.title',
    formGroup: this._formBuilder.group({
      firstName: new FormControl('', [Validators.required]),
      middleName: new FormControl(''),
      fatherLastName: new FormControl('', [Validators.required]),
      motherLastName: new FormControl(''),
      statusId: new FormControl('', [Validators.required]),
      titleId: new FormControl('', [Validators.required]),
      birthDate: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      postalAddress: new FormControl(''),
      cityId: new FormControl('', [Validators.required]),
      regionId: new FormControl('', [Validators.required]),
      areaCode: new FormControl(''),
      comments: new FormControl('')
    }),
    submitButtonShow: true,
    submitButtonText: 'employees.add.submitButton',
    cancelButtonShow: true,
    cancelButtonText: 'employees.add.cancelButton'
  };

  ngOnInit(): void {
    // Inicialización
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSubmit(): void {
    if (this.headerConfig.formGroup.valid) {
      const employee: EmployeeRequest = this.headerConfig.formGroup.value;

      this._employeeService.create(employee).subscribe({
        next: (response) => {
          this._notificationService.showSuccess('employees.messages.create.success');
          this._customRouterService.navigate(['employees']);
        },
        error: (error) => {
          this._notificationService.showError('employees.messages.create.error');
        }
      });
    }
  }

  onCancel(): void {
    this._customRouterService.navigate(['employees']);
  }
}
