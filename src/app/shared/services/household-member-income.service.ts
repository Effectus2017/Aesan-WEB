import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HouseholdMemberIncome {
  id: number;
  memberId: number;
  incomeTypeId: number;
  amount: number;
  frequencyId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface HouseholdMemberIncomeQuery {
  take?: number;
  skip?: number;
  search?: string;
  memberId?: number;
}

@Injectable({ providedIn: 'root' })
export class HouseholdMemberIncomeService {
  private readonly baseUrl = '/api/household-member-income';

  constructor(private http: HttpClient) {}

  getAll(params: HouseholdMemberIncomeQuery): Observable<{ items: HouseholdMemberIncome[]; total: number }> {
    return this.http.get<{ items: HouseholdMemberIncome[]; total: number }>(
      `${this.baseUrl}/get-all-household-member-incomes-from-db`,
      { params: params as any }
    );
  }

  getById(id: number): Observable<HouseholdMemberIncome> {
    return this.http.get<HouseholdMemberIncome>(`${this.baseUrl}/get-household-member-income-by-id`, { params: { id } });
  }

  add(data: HouseholdMemberIncome): Observable<any> {
    return this.http.post(`${this.baseUrl}/insert-household-member-income`, data);
  }

  update(data: HouseholdMemberIncome): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-household-member-income`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-household-member-income`, { params: { id } });
  }
}
