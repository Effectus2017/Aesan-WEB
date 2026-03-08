import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { DeliveryType } from '../models/catalog/DeliveryType';
import { DeliveryTypeRequest } from '../models/request/DeliveryTypeRequest';

@Injectable({
  providedIn: 'root',
})
export class DeliveryTypeService {
  private _deliveryTypes: BehaviorSubject<DeliveryType[] | null> = new BehaviorSubject(null);
  private _deliveryType: BehaviorSubject<DeliveryType | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/delivery-type`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  get deliveryTypes$(): Observable<DeliveryType[] | null> {
    return this._deliveryTypes.asObservable();
  }

  get deliveryType$(): Observable<DeliveryType | null> {
    return this._deliveryType.asObservable();
  }

  getDeliveryTypeById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-delivery-type-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._deliveryType.next(response)));
  }

  getAllDeliveryTypesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-delivery-types-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._deliveryTypes.next(response)));
  }

  insertDeliveryType(deliveryType: DeliveryTypeRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-delivery-type`, deliveryType, getHttpOptions(queryParameters));
  }

  updateDeliveryType(deliveryType: DeliveryType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-delivery-type`, deliveryType, getHttpOptions(queryParameters));
  }

  deleteDeliveryType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-delivery-type`, getHttpOptions(queryParameters));
  }

  create(data: Partial<DeliveryType>) {
    return this._httpClient.post(this.apiUrl, data);
  }

  update(data: Partial<DeliveryType>) {
    return this._httpClient.put(this.apiUrl, data);
  }

  getDeliveryTypesByProgram(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-delivery-types-by-program`, getHttpOptions(queryParameters));
  }

  getDeliveryTypesByGroupType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-delivery-types-by-group-type`, getHttpOptions(queryParameters));
  }
}
