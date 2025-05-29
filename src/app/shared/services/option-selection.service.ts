import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { OptionSelection } from '../models/OptionSelection';

@Injectable({
  providedIn: 'root',
})
export class OptionSelectionService {

  private _options: BehaviorSubject<OptionSelection[] | null> = new BehaviorSubject(null);
  private _option: BehaviorSubject<OptionSelection | null> = new BehaviorSubject(null);
  private apiUrl = `${environment.baseHttpUrl}/option-selection`;
  private _httpClient = inject(HttpClient);

  /**
   * Gets the current list of option selections as an observable
   */
  get options$(): Observable<OptionSelection[] | null> {
    return this._options.asObservable();
  }

  /**
   * Gets the current single option selection as an observable
   */
  get option$(): Observable<OptionSelection | null> {
    return this._option.asObservable();
  }

  /**
   * Fetches an option selection by ID from the API
   * @param queryParameters Query parameters including the option selection ID
   * @returns Observable with the option selection data
   */
  getOptionSelectionById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-option-selection-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._option.next(response)));
  }

  /**
   * Fetches an option selection by option key from the API
   * @param queryParameters Query parameters including the option key
   * @returns Observable with the option selection data
   */
  getOptionSelectionByOptionKey(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-option-selection-by-option-key`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._options.next(response)));
  }

  /**
   * Fetches all option selections from the API
   * @param queryParameters Query parameters for filtering/pagination
   * @returns Observable with the list of option selections
   */
  getAllOptionSelections(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-option-selections`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._options.next(response)));
  }

  /**
   * Inserts a new option selection via API
   * @param optionSelection The option selection data to insert
   * @param queryParameters Additional query parameters
   * @returns Observable with the API response
   */
  insertOptionSelection(optionSelection: OptionSelection, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-option-selection`, optionSelection, getHttpOptions(queryParameters));
  }

  /**
   * Updates an existing option selection via API
   * @param optionSelection The option selection data to update
   * @param queryParameters Additional query parameters
   * @returns Observable with the API response
   */
  updateOptionSelection(optionSelection: OptionSelection, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-option-selection`, optionSelection, getHttpOptions(queryParameters));
  }

  /**
   * Updates the display order of an option selection via API
   * @param optionSelectionId ID of the option selection to update
   * @param displayOrder New display order value
   * @param queryParameters Additional query parameters
   * @returns Observable with the API response
   */
  updateOptionSelectionDisplayOrder(optionSelectionId: number, displayOrder: number, queryParameters: QueryParameters): Observable<any> {
    // The API expects optionSelectionId and displayOrder as query params
    const params = { ...queryParameters, optionSelectionId, displayOrder };
    return this._httpClient.put(`${this.apiUrl}/update-option-selection-display-order`, null, getHttpOptions(params));
  }

  /**
   * Deletes an option selection via API
   * @param queryParameters Query parameters including the ID of option selection to delete
   * @returns Observable with the API response
   */
  deleteOptionSelection(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-option-selection`, getHttpOptions(queryParameters));
  }
}
