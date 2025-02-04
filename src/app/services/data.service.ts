import { Injectable } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { Approval, Employee, Overtime, OvertimeLimit, User } from '../models/data.model';
import { error } from 'node:console';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  //private apiUrl = 'http://backend-url';
  months: Date[] = [
    new Date(2025, 1),
    new Date(2025, 0),
    new Date(2024, 11),
    new Date(2024, 10),
    new Date(2024, 9),
    new Date(2024, 8),
    new Date(2024, 7),
    new Date(2024, 6),
    new Date(2024, 5),
    new Date(2024, 4),
    new Date(2024, 3),
    new Date(2024, 2),
    new Date(2024, 1),
    new Date(2024, 0),
    new Date(2023, 11)
  ];

  private selectedMonthSubject = new BehaviorSubject<Date>(new Date());
  selectedMonth$ = this.selectedMonthSubject.asObservable();

  employees: Employee[] = 
  [
    {
      employee_id: 1,
      personal_number: '31211302',
      username: 'zigopvo',
      level_role: 5,
      manager_id: 3,
      cost_center: '1234-5678',
      first_name: 'Pavol',
      last_name: 'Žigo',
      email: 'zigopvo@schaeffler.com',
      employed: true,
      approver: false
    },
    {
      employee_id: 2,
      personal_number: '31211308',
      username: 'zigo29',
      level_role: 5,
      manager_id: 3,
      cost_center: '1234-5679',
      first_name: 'Palo',
      last_name: 'Žigoho',
      email: 'zigopvo@schaeffler.com',
      employed: true,
      approver: false
    },
    {
      employee_id: 3,
      personal_number: '36511308',
      username: 'japrvy',
      level_role: 2,
      manager_id: null,
      cost_center: '1234-5679',
      first_name: 'Pivo',
      last_name: 'Živo',
      email: 'zigopivo@schaeffler.com',
      employed: true,
      approver: true
    }
  ];

  overtimes: Overtime[] = 
  [
    {
      overtime_id: 1,
      employee_id: 1,
      overtime_type_id: 1,
      creation_date: new Date(2024, 10, 1),
      overtime_day: new Date(2024, 11, 20),
      overtime_hours: 1.42,
      reason: 'Bakalárka',
      project_number: null
    },
    {
      overtime_id: 2,
      employee_id: 1,
      overtime_type_id: 1,
      creation_date: new Date(2024, 10, 1),
      overtime_day: new Date(2024, 11, 10),
      overtime_hours: 2.54,
      reason: 'Bakalárka zas',
      project_number: null
    },
    {
      overtime_id: 3,
      employee_id: 1,
      overtime_type_id: 1,
      creation_date: new Date(2024, 10, 1),
      overtime_day: new Date(2025, 0, 31),
      overtime_hours: 2.54,
      reason: 'Bakalárka zas',
      project_number: null
    },
    {
      overtime_id: 4,
      employee_id: 2,
      overtime_type_id: 1,
      creation_date: new Date(2024, 10, 1),
      overtime_day: new Date(2025, 0, 31),
      overtime_hours: 0.66,
      reason: 'Bakalárka zas',
      project_number: null
    },
    {
      overtime_id: 5,
      employee_id: 1,
      overtime_type_id: 2,
      creation_date: new Date(2024, 10, 1),
      overtime_day: new Date(2025, 0, 3),
      overtime_hours: 4.00,
      reason: 'Bakalárka zas',
      project_number: null
    },
    {
      overtime_id: 6,
      employee_id: 1,
      overtime_type_id: 3,
      creation_date: new Date(2024, 10, 1),
      overtime_day: new Date(2025, 1, 3),
      overtime_hours: 4.00,
      reason: 'Bakalárka zas',
      project_number: null
    }
  ];

  limits: OvertimeLimit[] =
  [
    {
      limit_id: 1,
      employee_id: 1,
      min_hours: 1.5,
      max_hours: 5,
      start_date: new Date(2025, 0),
      end_date: new Date(2025, 1),
      status_id: 'A'
    },
    {
      limit_id: 2,
      employee_id: 2,
      min_hours: 0.6,
      max_hours: 3,
      start_date: new Date(2025, 0),
      end_date: new Date(2025, 1),
      status_id: 'W'
    },
    {
      limit_id: 3,
      employee_id: 1,
      min_hours: 0.5,
      max_hours: 3,
      start_date: new Date(2024, 11),
      end_date: new Date(2025, 0),
      status_id: 'W'
    },
    {
      limit_id: 4,
      employee_id: 1,
      min_hours: 0,
      max_hours: 10,
      start_date: new Date(2025, 1),
      end_date: new Date(2025, 2),
      status_id: 'W'
    },
    {
      limit_id: 5,
      employee_id: 3,
      min_hours: 0.5,
      max_hours: 3,
      start_date: new Date(2025, 1),
      end_date: new Date(2025, 2),
      status_id: 'A'
    }
    
  ];

  approvals: Approval[] =
  [
    {
      approval_id: 1,
      limit_id: 1,
      approver_id: 2,
      approval_date: new Date(),
      status_id: 'A',
      comment: null
    }
  ];

  // const os = require('os');
  // const username = os.userInfo().username;
  mngUsername: string = 'japrvy'; // toto sa bude načítavať z windowsu
  selectedEmployee?: Employee;

  constructor() { }

  compareYearAndMonth(date1: Date, date2: Date): boolean
  {
    const year1 = date1.getFullYear();
    const month1 = date1.getMonth();
    const year2 = date2.getFullYear();
    const month2 = date2.getMonth();
    //console.log((year1 === year2 && month1 === month2));
    return year1 === year2 && month1 === month2;
  }

  getMonths(): Observable<Date[]>
  {
    //return this.http.get<Date[]>(`${this.apiUrl}/months`);
    return of(this.months);
  }

  setSelectedMonth(month: Date): void
  {
    this.selectedMonthSubject.next(month);
  }

  setSelectedEmployee(username: string): void
  {
    this.selectedEmployee = this.employees.find(x => x.username === username);
    console.log('Selected employee: ', this.selectedEmployee?.username);
  }

  getSelectedEmployee(): Observable<Employee | undefined>
  {
    return of(this.selectedEmployee);
  }

  // getSelectedMonth(): Observable<Date>
  // {
  //   return of(this.selectedMonth);
  // }

  getEmployee(username: string): Observable<Employee | undefined>
  {
    return of(this.employees.find(x => x.username === username));
  }

  getTeamMembers(manager_id: number): Observable<Employee[]>
  {
    return of(this.employees.filter(x => x.manager_id === manager_id));
  }

  getSumOvertime(employee_id: number, month: Date): number
  {
    let hisOvertimes: Overtime[] = this.overtimes.filter(x => x.employee_id === employee_id && this.compareYearAndMonth(month, x.overtime_day));
    let sum: number = 0;
    hisOvertimes.forEach(overtime => {
      sum += overtime.overtime_hours;
    });
    return sum;
  }

  getMaxLimit(employee_id: number, month: Date): number
  {
    let limit = this.limits.find(x => x.employee_id === employee_id && this.compareYearAndMonth(x.start_date, month))?.max_hours
    if (limit == undefined)
    {
      //throw new Error('Limit was not found! ' + employee_id);
      return 0;
    }
    return limit;
  }

  getMinLimit(employee_id: number, month: Date): number
  {
    let limit = this.limits.find(x => x.employee_id === employee_id && this.compareYearAndMonth(x.start_date, month))?.min_hours
    if (limit == undefined)
    {
      //throw new Error('Limit was not found! ' + employee_id);
      return 0;
    }
    return limit;
  }

  getApproval(limit_id: number): boolean
  {
    return this.approvals.find(x => x.limit_id == limit_id)?.status_id === 'A';
  }

  getUsername(): Observable<string>
  {
    return of(this.mngUsername);
  }
}
