import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { EmailTemplate } from '../models/log/EmailTemplate';

@Injectable({
  providedIn: 'root',
})
export class EmailTemplateService {
  private apiUrl = `${environment.baseHttpUrl}/email-template`;
  private _httpClient = inject(HttpClient);

  /**
   * Fetches an email template by ID from the API
   * @param queryParameters Query parameters including the template ID
   * @returns Observable with the email template data
   */
  getEmailTemplateById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(
      `${this.apiUrl}/get-email-template-by-id`,
      getHttpOptions(queryParameters)
    );
  }

  /**
   * Fetches an email template by key from the API
   * @param queryParameters Query parameters including the template key
   * @returns Observable with the email template data
   */
  getEmailTemplateByKey(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(
      `${this.apiUrl}/get-email-template-by-key`,
      getHttpOptions(queryParameters)
    );
  }

  /**
   * Fetches all email templates from the API
   * @param queryParameters Query parameters for pagination and filtering
   * @returns Observable with the list of email templates
   */
  getAllEmailTemplates(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(
      `${this.apiUrl}/get-all-email-templates`,
      getHttpOptions(queryParameters)
    );
  }

  /**
   * Inserts a new email template
   * @param emailTemplate The email template to insert
   * @returns Observable with the result
   */
  insertEmailTemplate(emailTemplate: EmailTemplate): Observable<any> {
    return this._httpClient.post(
      `${this.apiUrl}/insert-email-template`,
      emailTemplate,
      getHttpOptions({})
    );
  }

  /**
   * Updates an existing email template
   * @param emailTemplate The email template to update
   * @returns Observable with the result
   */
  updateEmailTemplate(emailTemplate: Partial<EmailTemplate>): Observable<any> {
    return this._httpClient.put(
      `${this.apiUrl}/update-email-template`,
      emailTemplate,
      getHttpOptions({})
    );
  }
}

