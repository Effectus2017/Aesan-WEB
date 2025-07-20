import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { QueryParameters } from '../models/QueryParameters';
import { Employee, EmployeeList } from '../models/Employee';
import { EmployeeRequest } from '../models/Request/EmployeeRequest';

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
   * Obtiene todos los empleados desde la base de datos
   * @param queryParams Parámetros de consulta (paginación, filtros, etc.)
   * @returns Observable con la lista de empleados y el conteo total
   */
  getAllEmployeesFromDb(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/employee`, { params: queryParams as any })
      .pipe(
        tap((response: any) => {
          this._employees.next(response.data);
        })
      );
  }

  /**
   * Obtiene un empleado específico por ID
   * @param queryParams Parámetros de consulta que incluyen el ID del empleado
   * @returns Observable con los datos del empleado
   */
  getEmployeeById(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/employee/by-id`, { params: queryParams as any })
      .pipe(
        tap((response: any) => {
          this._employee.next(response.data);
        })
      );
  }

  /**
   * Crea un nuevo empleado
   * @param employee Datos del empleado a crear
   * @returns Observable con la respuesta del servidor
   */
  insertEmployee(employee: EmployeeRequest): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/employee`, employee)
      .pipe(
        tap(() => {
          // Invalidar caché después de crear
          this._employees.next(null);
        })
      );
  }

  /**
   * Actualiza un empleado existente
   * @param employee Datos del empleado a actualizar
   * @returns Observable con la respuesta del servidor
   */
  updateEmployee(employee: EmployeeRequest): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/employee`, employee)
      .pipe(
        tap(() => {
          // Invalidar caché después de actualizar
          this._employees.next(null);
          this._employee.next(null);
        })
      );
  }

  /**
   * Elimina un empleado (baja lógica)
   * @param queryParams Parámetros de consulta que incluyen el ID del empleado
   * @returns Observable con la respuesta del servidor
   */
  deleteEmployee(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/employee`, { params: queryParams as any })
      .pipe(
        tap(() => {
          // Invalidar caché después de eliminar
          this._employees.next(null);
          this._employee.next(null);
        })
      );
  }

  /**
   * Convierte un empleado en usuario del sistema
   * @param employeeId ID del empleado a convertir
   * @param userId ID del usuario a asignar
   * @returns Observable con la respuesta del servidor
   */
  convertEmployeeToUser(employeeId: number, userId: string): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/employee/convert-to-user`, null, {
      params: { employeeId: employeeId.toString(), userId }
    })
    .pipe(
      tap(() => {
        // Invalidar caché después de la conversión
        this._employees.next(null);
        this._employee.next(null);
      })
    );
  }

  /**
   * Actualiza el estado activo de un empleado
   * @param employeeId ID del empleado
   * @param isActive Nuevo estado activo
   * @returns Observable con la respuesta del servidor
   */
  updateEmployeeActiveStatus(employeeId: number, isActive: boolean): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/employee/active-status`, null, {
      params: { employeeId: employeeId.toString(), isActive: isActive.toString() }
    })
    .pipe(
      tap(() => {
        // Invalidar caché después de actualizar el estado
        this._employees.next(null);
        this._employee.next(null);
      })
    );
  }

  /**
   * Verifica si existe un empleado principal
   * @returns Observable con la respuesta del servidor
   */
  hasMainEmployee(): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/employee/has-main`);
  }

  // Métodos de compatibilidad (mantener para no romper código existente)
  getAll(queryParams: QueryParameters): Observable<any> {
    return this.getAllEmployeesFromDb(queryParams);
  }

  getById(queryParams: QueryParameters): Observable<any> {
    return this.getEmployeeById(queryParams);
  }

  create(employee: EmployeeRequest): Observable<any> {
    return this.insertEmployee(employee);
  }

  update(employee: EmployeeRequest): Observable<any> {
    return this.updateEmployee(employee);
  }

  delete(queryParams: QueryParameters): Observable<any> {
    return this.deleteEmployee(queryParams);
  }

  convertToUser(employeeId: number, userId: string): Observable<any> {
    return this.convertEmployeeToUser(employeeId, userId);
  }
}
