import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProgramRequest } from '../models/program-request.types';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({providedIn: 'root'})
export class ProgramRequestService {
    private _httpClient = inject(HttpClient);
    private _authService = inject(AuthService);
    private _baseUrl = `${environment.baseHttpUrl}/program-requests`;

    /**
     * Obtener solicitudes por agencia
     */
    getRequestsByAgency(): Observable<ProgramRequest[]> {
        const agency = this._authService.getUserAgency();
        return this._httpClient.get<ProgramRequest[]>(`${this._baseUrl}/agency/${agency}`);
    }
}
