import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) { }

  getDocuments(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getDocumentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createDocument(document: any): Observable<any> {
    return this.http.post(this.apiUrl, document);
  }

  updateDocument(id: number, document: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, document);
  }

  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
