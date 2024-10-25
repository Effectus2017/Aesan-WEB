import { SelectionModel } from '@angular/cdk/collections';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';

import { isNullOrUndefinedEmptyStringNullArray } from 'app/core/utils';

import { Subject, takeUntil } from 'rxjs';
import { CustomersService } from '../../customers/customers.service';
import { Customer, Subscription } from '../../customers/customers.types';
import { SubscriptionService } from '../../subscriptions/subscriptions.service';
import { CustomRouterService } from 'app/core/services/custom-router.service';



@Component({
  selector: 'app-admin-customer-edit',
  standalone: true,
  templateUrl: './edit.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    NgClass,
    MatInputModule,
    TextFieldModule,
    MatDividerModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    MatTableModule,
    MatPaginatorModule,
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
  ],
})
export class EditCustomerComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  title?: string = 'Editar';
  formFieldHelpers: string[] = [''];
  formRoot: UntypedFormGroup;

  customerId: string;
  customer: Customer;
  errorMessage: string = '';
  isLoading: boolean = false;

  private _formBuilder = inject(UntypedFormBuilder);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _customersService = inject(CustomersService);
  private _subscriptionService = inject(SubscriptionService);
  private _route = inject(ActivatedRoute);
  private _customRouterService = inject(CustomRouterService);


  constructor() {}

  get domainControl() {
    return this.formRoot.get('domain');
  }

  ngOnInit() {
    // Inicializar el formulario
    this.formRoot = this._formBuilder.group({

    });

    // this._customersService.customer$.pipe(takeUntil(this._unsubscribeAll)).subscribe({
    //   next: (response: any) => {
    //     // Extraer el cuerpo de la respuesta
    //     this.customer = response.body;
    //     this.populateForm();
    //     this.isLoading = false;
    //     this._changeDetectorRef.markForCheck();
    //   },
    //   error: (error) => {
    //     console.error('Error al cargar los datos del cliente:', error);
    //     this.errorMessage = 'No se pudo cargar la información del cliente. Por favor, inténtelo de nuevo.';
    //     this.isLoading = false;
    //     this._changeDetectorRef.markForCheck();
    //   },
    // });

    // this._subscriptionService.subscriptions$.pipe(takeUntil(this._unsubscribeAll)).subscribe({
    //   next: (response: any) => {
    //     console.log('Subscripciones obtenidas exitosamente:', response);
    //     this.subscriptionsDataSource.data = response.body.data;
    //     this.length = response.body.count;
    //     this.isLoading = false;
    //     this._changeDetectorRef.markForCheck();
    //   },
    // });
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  populateForm() {
    // if (this.customer) {
    //   this.formRoot.patchValue({
    //     domain: this.customer.companyProfile?.domain?.replace('.onmicrosoft.com', ''),
    //     organizationRegistrationNumber: this.customer.companyProfile?.organizationRegistrationNumber,
    //     firstName: this.customer.billingProfile?.defaultAddress?.firstName,
    //     middleName: this.customer.billingProfile?.defaultAddress?.middleName,
    //     lastName: this.customer.billingProfile?.defaultAddress?.lastName,
    //     email: this.customer.billingProfile?.email,
    //     culture: this.customer.billingProfile?.culture,
    //     language: this.customer.billingProfile?.language,
    //     companyName: this.customer.billingProfile?.companyName,

    //     addressLine1: this.customer.billingProfile?.defaultAddress?.addressLine1,
    //     addressLine2: this.customer.billingProfile?.defaultAddress?.addressLine2,
    //     city: this.customer.billingProfile?.defaultAddress?.city,
    //     state: this.customer.billingProfile?.defaultAddress?.state,
    //     postalCode: this.customer.billingProfile?.defaultAddress?.postalCode,
    //     country: this.customer.billingProfile?.defaultAddress?.country,
    //     phoneNumber: this.customer.billingProfile?.defaultAddress?.phoneNumber,
    //     enableGDAPByDefault: this.customer.allowDelegatedAccess, // Usando allowDelegatedAccess como aproximación
    //   });
    // }
  }

  onSubmit() {

  }

  onUpdate() {
    // this.isLoading = true;
    // this.errorMessage = '';
    // const formValue = this.formRoot.value;

    // const updatedCustomer: Customer = {
    //   id: this.customerId,
    //   companyProfile: {
    //     domain: `${formValue.domain}.onmicrosoft.com`,
    //     organizationRegistrationNumber: formValue.organizationRegistrationNumber,
    //     companyName: formValue.companyName,
    //   },
    //   billingProfile: {
    //     email: formValue.email,
    //     culture: formValue.culture,
    //     language: formValue.language,
    //     companyName: formValue.companyName,
    //     defaultAddress: {
    //       firstName: formValue.firstName,
    //       lastName: formValue.lastName,
    //       middleName: formValue.middleName,
    //       country: formValue.country,
    //       addressLine1: formValue.addressLine1,
    //       addressLine2: formValue.addressLine2,
    //       city: formValue.city,
    //       state: formValue.state,
    //       postalCode: formValue.postalCode,
    //     },
    //   },
    //   allowDelegatedAccess: formValue.enableGDAPByDefault,
    //   // Mantén otros campos que no se modifican
    //   commerceId: this.customer.commerceId,
    //   billingProfileId: this.customer.billingProfileId,
    //   relationshipToPartner: this.customer.relationshipToPartner,
    //   customDomains: this.customer.customDomains,
    //   attributes: this.customer.attributes,
    //   subscriptions: this.customer.subscriptions,
    // };

    // this._customersService.update(updatedCustomer, {}).subscribe({
    //   next: (response) => {
    //     console.log('Cliente actualizado exitosamente:', response);
    //     this.isLoading = false;
    //     this._customRouterService.navigate(['customers']);
    //   },
    //   error: (error) => {
    //     console.error('Error al actualizar el cliente:', error);
    //     this.errorMessage = 'Hubo un error al actualizar el cliente. Por favor, inténtelo de nuevo.';
    //     this.isLoading = false;
    //     this._changeDetectorRef.markForCheck();
    //   },
    // });
  }

  updateFromMPC() {
    // this._subscriptionService.getAllSubscriptionsFromMPCByCustomerId({ customerId: this.customer.id, saveToDb: true }).subscribe({
    //   next: (response) => {
    //     console.log('Subscripciones obtenidas exitosamente:', response);
    //     this.isLoading = false;
    //     this._customersService.getCustomerById({ id: this.customer.id }).subscribe();
    //   },
    //   error: (error) => {
    //     console.error('Error al obtener subsripciones:', error);
    //     this.errorMessage = 'Hubo un error al actualizar el cliente. Por favor, inténtelo de nuevo.';
    //     this.isLoading = false;
    //     this._changeDetectorRef.markForCheck();
    //   },
    // });
  }

  onBack() {
    //this._customRouterService.navigate(['customers']);
  }

  selectHandler(row: Subscription) {
    //this.selection.toggle(row);
  }

  getPaginator(event?: PageEvent) {
    // const index = !isNullOrUndefinedEmptyStringNullArray(event.pageIndex) ? event.pageIndex : 0;
    // this.pageSize = event.pageSize;

    // // Aquí podrías implementar la paginación si es necesario
    // // Por ahora, solo actualizamos los datos mostrados
    // const startIndex = index * this.pageSize;
    // const endIndex = startIndex + this.pageSize;
    // this.subscriptionsDataSource.data = this.customer.subscriptions.slice(startIndex, endIndex);
  }

  onEdit(event: Event, id: number) {
    // event.stopPropagation();
    // event.preventDefault();
    // this._customRouterService.navigate([`subscriptions/edit/${id}`]);
  }

  onCart() {
    // this._customRouterService.navigate([`customers/${this.customer.id}/cart/${this.customer.cartId}`]);
  }
}
