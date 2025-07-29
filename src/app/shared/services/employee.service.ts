import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { QueryParameters } from '../models/QueryParameters';
import { Employee } from '../models/Employee';
import { EmployeeRequest } from '../models/Request/EmployeeRequest';
import { getHttpOptions } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private _employees: BehaviorSubject<Employee[] | null> = new BehaviorSubject(null);
  private _employee: BehaviorSubject<Employee | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/employee`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  // Getters para observables
  get employees$(): Observable<Employee[] | null> {
    return this._employees.asObservable();
  }

  get employee$(): Observable<Employee | null> {
    return this._employee.asObservable();
  }

   /**
   * Obtiene un empleado específico por ID
   * @param queryParams Parámetros de consulta que incluyen el ID del empleado
   * @returns Observable con los datos del empleado
   */
   getEmployeeById(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-employee-by-id`, getHttpOptions(queryParams))
    .pipe(tap((response: any) => this._employee.next(response)));
  }

  /**
   * Obtiene todos los empleados desde la base de datos
   * @param queryParams Parámetros de consulta (paginación, filtros, etc.)
   * @returns Observable con la lista de empleados y el conteo total
   */
  getAllEmployeesFromDb(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-employees-from-db`, getHttpOptions(queryParams))
    .pipe(tap((response: any) => this._employees.next(response)));
  }



  /**
   * Crea un nuevo empleado
   * @param employee Datos del empleado a crear
   * @returns Observable con la respuesta del servidor
   */
  insertEmployee(employee: EmployeeRequest, queryParams: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-employee`, employee, getHttpOptions(queryParams))
  }

  /**
   * Actualiza un empleado existente
   * @param employee Datos del empleado a actualizar
   * @returns Observable con la respuesta del servidor
   */
  updateEmployee(employee: EmployeeRequest, queryParams: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-employee`, employee, getHttpOptions(queryParams));
  }

  /**
   * Elimina un empleado (baja lógica)
   * @param queryParams Parámetros de consulta que incluyen el ID del empleado
   * @returns Observable con la respuesta del servidor
   */
  deleteEmployee(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-employee`, { params: queryParams as any });
  }

  /**
   * Convierte un empleado en usuario del sistema
   * @param employeeId ID del empleado a convertir
   * @param userId ID del usuario a asignar
   * @returns Observable con la respuesta del servidor
   */
  convertEmployeeToUser(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/convert-employee-to-user`, null, getHttpOptions(queryParams))
  }

  /**
   * Actualiza el estado activo de un empleado
   * @param employeeId ID del empleado
   * @param isActive Nuevo estado activo
   * @returns Observable con la respuesta del servidor
   */
  updateEmployeeActiveStatus(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-employee-active-status`, null, getHttpOptions(queryParams));
  }

  /**
   * Verifica si existe un empleado principal
   * @returns Observable con la respuesta del servidor
   */
  hasMainEmployee(): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/has-main-employee`);
  }
}
