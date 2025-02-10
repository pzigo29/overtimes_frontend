import { Injectable } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { Approval, Employee, Overtime, OvertimeLimit, User } from '../models/data.model';
import { error } from 'node:console';
import { HttpClient } from '@angular/common/http';

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
      username: 'kralmln',
      level_role: 5,
      manager_id: 5,
      cost_center: '1234-5679',
      first_name: 'Milan',
      last_name: 'Kráľ',
      email: 'zigopvo@schaeffler.com',
      employed: true,
      approver: false
    },
    {
      employee_id: 3,
      personal_number: '36511308',
      username: 'rechjoz',
      level_role: 4,
      manager_id: 4,
      cost_center: '1234-5679',
      first_name: 'Jozef',
      last_name: 'Rechtorík',
      email: 'zigopivo@schaeffler.com',
      employed: true,
      approver: true
    },
    {
      employee_id: 4,
      personal_number: '36841308',
      username: 'roskmln',
      level_role: 2,
      manager_id: 7,
      cost_center: '1234-5679',
      first_name: 'Milan',
      last_name: 'Roško',
      email: 'zigopivo@schaeffler.com',
      employed: true,
      approver: true
    },
    {
      employee_id: 5,
      personal_number: '36841708',
      username: 'vrabarn',
      level_role: 4,
      manager_id: 4,
      cost_center: '1234-5679',
      first_name: 'Arnold',
      last_name: 'Vrabko',
      email: 'zigopivo@schaeffler.com',
      employed: true,
      approver: true
    },
    {
      employee_id: 6,
      personal_number: '87841708',
      username: 'biromchl',
      level_role: 5,
      manager_id: 4,
      cost_center: '1234-5679',
      first_name: 'Michal',
      last_name: 'Bíroš',
      email: 'zigopivo@schaeffler.com',
      employed: true,
      approver: true
    },
    {
      employee_id: 7,
      personal_number: '87895708',
      username: 'klmkjn',
      level_role: 1,
      manager_id: null,
      cost_center: '1234-5679',
      first_name: 'Ján',
      last_name: 'Klimko',
      email: 'zigopivo@schaeffler.com',
      employed: true,
      approver: true
    },
    {
      employee_id: 8,
      personal_number: '87895638',
      username: 'lacojan',
      level_role: 3,
      manager_id: 7,
      cost_center: '1234-5679',
      first_name: 'Ján',
      last_name: 'Laco',
      email: 'zigopivo@schaeffler.com',
      employed: true,
      approver: true
    },
    {
      employee_id: 9,
      personal_number: '87896521',
      username: 'trmpdnl',
      level_role: 5,
      manager_id: 8,
      cost_center: '1234-5679',
      first_name: 'Donald',
      last_name: 'Trump',
      email: 'zigopivo@schaeffler.com',
      employed: true,
      approver: false
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
    },
    {
      limit_id: 6,
      employee_id: 9,
      min_hours: 0.23,
      max_hours: 65,
      start_date: new Date(2025, 1),
      end_date: new Date(2025, 2),
      status_id: 'A'
    },
    {
      limit_id: 7,
      employee_id: 4,
      min_hours: 0.54,
      max_hours: 16,
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
  rndUsername: string = 'klmkjn';
  // mngUsername: string | null = 'lacojan'; // toto sa bude načítavať z windowsu
  // tlUsername: string | null = 'lacojan';
  // thpUsername: string | null = 'roskmln';
  mngUsername: string | null = 'roskmln'; // toto sa bude načítavať z windowsu
  tlUsername: string | null = 'klmkjn';
  thpUsername: string | null = 'zigopvo';
  // mngUsername: string = 'rechjoz';
  selectedEmployee?: Employee;

  private apiUrl = 'https://localhost:7198/api';

  constructor(private http: HttpClient) { } 

  getMessage(username: string): Observable<string>
  {
    return this.http.get<string>(`${this.apiUrl}/Employee?username=${username}`, { responseType: 'text' as 'json' });
  }

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

  // VSETKY TIETO GETTRE BY ASI MALI BYT API VOLANIA NA BACKEND, KTORE BY UROBILI SELECT Z DATABAZY!!!

  getEmployee(username: string): Observable<Employee | undefined>
  {
    return of(this.employees.find(x => x.username === username));
  }

  getTeamMembers(manager_id: number): Observable<Employee[]>
  {
    return of(this.employees.filter(x => x.manager_id === manager_id));
  }

  getTeamLeaders(manager_id: number): Observable<Employee[]>
  {
    let teamLeaders = this.employees.filter(x => x.manager_id === manager_id);
    teamLeaders = teamLeaders.filter(leader => {
      let subordinates = this.employees.filter(x => x.manager_id === leader.employee_id);
      return subordinates.length > 0;
    });
    return of(teamLeaders);
  }

  getSegmentManagers(rnd_id: number): Observable<Employee[]>
  {
    return of(this.employees.filter(x => x.manager_id === rnd_id && (x.level_role === 2 || x.level_role === 3 )));
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

  getMinLimitTeam(manager_id: number, month: Date): Map<string, number>
  {
    let team: Employee[] = this.employees.filter(x => x.manager_id === manager_id);
    let teamMinLimits: Map<string, number> = new Map();
    team.forEach(member => {

      let subordinates: Employee[] = this.employees.filter(x => x.manager_id === member.employee_id);
      if (subordinates.length > 0)
      {
        let subMinLimits: Map<string, number> = this.getMinLimitTeam(member.employee_id, month);
        subMinLimits.forEach((value, key) => {
          teamMinLimits.set(key, value);
        });
      }
      else
      {
        teamMinLimits.set(member.username, this.getMinLimit(member.employee_id, month));
      }      
    });
    return teamMinLimits;
  }

  getMaxLimitTeam(manager_id: number, month: Date): Map<string, number>
  {
    let team: Employee[] = this.employees.filter(x => x.manager_id === manager_id);
    let teamMaxLimits: Map<string, number> = new Map();
    team.forEach(member => {
      let subordinates: Employee[] = this.employees.filter(x => x.manager_id === member.employee_id);
      if (subordinates.length > 0)
      {
        let subMaxLimits: Map<string, number> = this.getMaxLimitTeam(member.employee_id, month);
        subMaxLimits.forEach((value, key) => {
          teamMaxLimits.set(key, value);
        });
      }
      else
      {
        teamMaxLimits.set(member.username, this.getMaxLimit(member.employee_id, month));
      }
    });
    return teamMaxLimits;
  }

  getSumOvertimeTeam(manager_id: number, month: Date): Map<string, number>
  {
    let team: Employee[] = this.employees.filter(x => x.manager_id === manager_id);
    let teamRealOvertimes: Map<string, number> = new Map();
    team.forEach(member => {
      let subordinates: Employee[] = this.employees.filter(x => x.manager_id === member.employee_id);
      if (subordinates.length > 0)
      {
        let subRealOvertimes: Map<string, number> = this.getSumOvertimeTeam(member.employee_id, month);
        subRealOvertimes.forEach((value, key) => {
          teamRealOvertimes.set(key, value);
        });
      }
      else
      {
        teamRealOvertimes.set(member.username, this.getSumOvertime(member.employee_id, month)); // ak sa má zaratávať aj TL, len to dať preč z else
      }
    });
    // console.log('Team real overtimes: ', teamRealOvertimes);
    return teamRealOvertimes;
  }

  getMinLimitTeamSum(manager_id: number, month: Date): number
  {
    let teamMinLimits: Map<string, number> = this.getMinLimitTeam(manager_id, month);
    let sum: number = 0;
    teamMinLimits.forEach((value, key) => {
      sum += value;
    });
    return sum;
  }

  getMaxLimitTeamSum(manager_id: number, month: Date): number
  {
    let teamMaxLimits: Map<string, number> = this.getMaxLimitTeam(manager_id, month);
    let sum: number = 0;
    teamMaxLimits.forEach((value, key) => {
      sum += value;
    });
    return sum;
  }

  getSumOvertimeTeamSum(manager_id: number, month: Date): number
  {
    let teamRealOvertimes: Map<string, number> = this.getSumOvertimeTeam(manager_id, month);
    let sum: number = 0;
    teamRealOvertimes.forEach((value, key) => {
      sum += value;
    });
    return sum;
  }

  getApproval(limit_id: number): boolean
  {
    return this.approvals.find(x => x.limit_id == limit_id)?.status_id === 'A';
  }

  getRndUsername(): Observable<string | null>
  {
    return of(this.rndUsername);
  }

  getMngUsername(): Observable<string | null>
  {
    return of(this.mngUsername);
  }

  getTlUsername(): Observable<string | null>
  {
    return of(this.tlUsername);
  }

  getThpUsername(): Observable<string | null>
  {
    return of(this.thpUsername);
  }
}
