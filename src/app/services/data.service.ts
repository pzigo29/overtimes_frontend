import { Injectable, OnInit } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
import { of, Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { Approval, Email, Employee, Overtime, OvertimeLimit, OvertimeType, ScheduledJobs, WorkflowActionSchedule } from '../models/data.model';
import { error } from 'node:console';
import { HttpClient } from '@angular/common/http';
import * as os from 'os';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit {

  private overtimeSubject = new BehaviorSubject<Map<string, number>>(new Map<string, number>());
  private selectedMonthSubject = new BehaviorSubject<Date>(new Date());
  overtime$ = this.overtimeSubject.asObservable();
  selectedMonth$ = this.selectedMonthSubject.asObservable();

  // const os = require('os');
  // username: string = os.userInfo().username;
  username: string = 'admin'; // toto sa bude načítavať z windowsu
  rndUsername: string = '';
  mngUsername: string | null = this.username;
  tlUsername: string | null = this.username;
  thpUsername: string | null = this.username;
  assistantUsername: string | null = this.username;
  // assistantUsername: string | null = 'mikimaja';
  selectedEmployee?: Employee;
  userEmployee?: Employee;

  // private apiUrl = 'https://localhost:7198/api';
  private apiUrl = 'http://localhost:5001/api';

  constructor(private http: HttpClient) 
  {
    // this.username = os.userInfo().username;
    this.initUserEmployee();
  } 

  private initUserEmployee(): void
  {
    this.getEmployee(this.username).subscribe(
      (data: Employee | undefined) => {
        this.userEmployee = data;
        console.log('userEmployee: ' + this.userEmployee?.username);
      },
      (error: any) => {
        console.error('Error fetching userEmployee', error);
      }
    );
    this.rndUsername = this.username == 'klmkjn' ? this.username : '';
  }

  ngOnInit()
  {
    // console.log('hereeeeeeee');
    // try
    // {
    //   this.username = os.userInfo().username;
    // }
    // catch (error)
    // {
    //   console.error('Error fetching username in dataService: ', error);
    // }
    // this.getEmployee(this.username).subscribe(
    //   (data: Employee | undefined) => {
    //     this.userEmployee = data;
    //     console.log('userEmployee: ' + this.userEmployee?.username);
    //   },
    //   (error: any) => {
    //     console.error('Error fetching userEmployee', error);
    //   }
    // );
  }

  getMessage(username: string): Observable<string>
  {
    // return this.http.get<string>(`${this.apiUrl}/Employee?username=${username}`, { responseType: 'text' as 'json' });
    return this.http.get<string>(`${this.apiUrl}/WeatherForecast`, { responseType: 'text' as 'json' });
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
    const months: Observable<Date[]> = this.http.get<Date[]>(`${this.apiUrl}/OvertimeLimit/months`);
    return months;
  }

  setSelectedMonth(month: Date): void
  {
    this.selectedMonthSubject.next(month);
  }

  setSelectedEmployee(username: string): Promise<void>
  {
    return new Promise((resolve, reject) => {
      this.getEmployee(username).subscribe(
        (data: Employee | undefined) => {
          this.selectedEmployee = data;
          // console.log('Selected employee: ', this.selectedEmployee?.username);
          resolve();
        },
        (error: any) => {
          console.error('Error fetching employee', error);
          reject(error);
        }
      );
    });
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

  getEmployee(username: string): Observable<Employee | undefined> {
    return this.http.get<Employee>(`${this.apiUrl}/Employee/${username}`);
  }

  getTeamMembers(manager_id: number): Observable<Employee[]>
  {
    // console.log('in getTeamMembers');
    return this.http.get<Employee[]>(`${this.apiUrl}/Employee/team/${manager_id}`);
  }

  getTeamLeaders(manager_id: number): Observable<Employee[]>
  {
    return this.http.get<Employee[]>(`${this.apiUrl}/Employee/tl/${manager_id}`);
  }

  getSegmentManagers(rnd_id: number): Observable<Employee[]>
  {
    // return of(this.employees.filter(x => x.managerId === rnd_id && (x.levelRole === 2 || x.levelRole === 3 )));
    return this.http.get<Employee[]>(`${this.apiUrl}/Employee/mng/${rnd_id}`);
  }

  getEmployees(): Observable<Employee[]>
  {
    // return of(this.employees);
    return this.http.get<Employee[]>(`${this.apiUrl}/Employee`);
  }

  async getOvertimeLimit(employee_id: number, month: Date | string): Promise<OvertimeLimit>
  {
    try
    {
      const limits: OvertimeLimit = await firstValueFrom(this.http.get<OvertimeLimit>(`${this.apiUrl}/OvertimeLimit/employee_id?employeeId=${employee_id}&month=${typeof month === 'string' ? month : month.toDateString()}`));
      return limits;
    }
    catch (error)
    {
      console.error('Error fetching limits: ', error);
      throw new Error('Failed to retrieve limits');
    }
  }

  async getSumOvertime(employee_id: number, month: Date | string): Promise<number>
  {
    try
    {
      const overtimes: Overtime[] = await firstValueFrom(this.http.get<Overtime[]>(`${this.apiUrl}/Overtime/GetOvertimes?employeeId=${employee_id}&month=${typeof month === 'string' ? month : month.toDateString()}`));
      // let hisOvertimes: Overtime[] = this.overtimes.filter(x => x.employee_id === employee_id && this.compareYearAndMonth(month, x.overtime_day));
      let sum: number = 0;
      overtimes.forEach(overtime => {
        sum += overtime.overtimeHours;
      });
      return sum;
    }
    catch (error)
    {
      console.error('Error fetching overtimes: ', error);
      throw new Error('Failed to retrieve overtimes');
    }
  }

  async getMaxLimit(employee_id: number, month: Date): Promise<number>
  {
    // let limit = this.limits.find(x => x.employee_id === employee_id && this.compareYearAndMonth(x.start_date, month))?.max_hours
    const limit: OvertimeLimit = await firstValueFrom(this.http.get<OvertimeLimit>(`${this.apiUrl}/OvertimeLimit/employee_id?employeeId=${employee_id}&month=${typeof month === 'string' ? month : month.toDateString()}`));
    if (limit == undefined)
    {
      //throw new Error('Limit was not found! ' + employee_id);
      return 0;
    }
    return limit.maxHours;
  }

  async getMinLimit(employee_id: number, month: Date): Promise<number>
  {
    // let limit = this.limits.find(x => x.employee_id === employee_id && this.compareYearAndMonth(x.start_date, month))?.min_hours
    const limit: OvertimeLimit = await firstValueFrom(this.http.get<OvertimeLimit>(`${this.apiUrl}/OvertimeLimit/employee_id?employeeId=${employee_id}&month=${typeof month === 'string' ? month : month.toDateString()}`));
    if (limit == undefined)
    {
      //throw new Error('Limit was not found! ' + employee_id);
      return 0;
    }
    return limit.minHours;
  }

  async getApprovedStatus(employee_id: number, month: Date): Promise<boolean>
  {
    const limit: OvertimeLimit = await firstValueFrom(this.http.get<OvertimeLimit>(`${this.apiUrl}/OvertimeLimit/employee_id?employeeId=${employee_id}&month=${typeof month === 'string' ? month : month.toDateString()}`));
    if (limit == undefined)
    {
      //throw new Error('Limit was not found! ' + employee_id);
      return false;
    }
    return limit.statusId === 'A';
  }

  async setApprovedStatus(employee_id: number, approverId: number, month: Date, status: string, comment: string): Promise<void>
  {
    try
    {
      
      const limit: OvertimeLimit = await firstValueFrom(this.http.get<OvertimeLimit>(`${this.apiUrl}/OvertimeLimit/employee_id?employeeId=${employee_id}&month=${typeof month === 'string' ? month : month.toDateString()}`));
      if (limit == undefined)
      {
        throw new Error('Limit was not found! ' + employee_id);
      }
      console.log('Setting approved status, limit: ', limit);
      await firstValueFrom(this.http.post(`${this.apiUrl}/Approval/PostApprovalByLimit?limitId=${limit.limitId}&approverId=${approverId}&comment=${comment}&approvalStatus=${status}`, null));
    }
    catch (error)
    {
      console.error('Error setting approved status: ', error);
      throw error;
    }
  }

  async setLimit(employee_id: number, month: Date, min_hours: number, max_hours: number, reason?: string | null): Promise<void> {
    try {
      const limit: OvertimeLimit = await firstValueFrom(this.http.get<OvertimeLimit>(`${this.apiUrl}/OvertimeLimit/employee_id?employeeId=${employee_id}&month=${typeof month === 'string' ? month : month.toDateString()}`));
      
      if (!limit) {
        throw new Error('Limit not found');
      }
  
      limit.minHours = min_hours;
      limit.maxHours = max_hours;
      // limit.reason = reason;
      if (reason !== undefined)
      {
        // console.log('Reason: ', reason);
        limit.reason = reason;
      }
  
      await firstValueFrom(this.http.put(`${this.apiUrl}/OvertimeLimit/limit`, limit));

      // Update the overtime values and emit the new values
      const currentOvertimes = this.overtimeSubject.value;
      currentOvertimes.set(employee_id.toString(), max_hours);
      this.overtimeSubject.next(currentOvertimes);
    } catch (error) {
      console.error('Error setting limit:', error);
      throw error;
    }
  }

  async getMinLimitTeam(manager_id: number, month: Date): Promise<Map<string, number>>
  {
    let team: Employee[] = await firstValueFrom(this.getTeamMembers(manager_id));
    // console.log('Team: ', team);
    let teamMinLimits: Map<string, number> = new Map();
    for (const member of team) {
      // console.log('Member: ', member.username, member.levelRole);
      if (member.levelRole !== 5 && member.levelRole !== 0)
      {
        // console.log('Member could have subordinates: ', member.username);
        let subordinates: Employee[] = await firstValueFrom(this.getTeamMembers(member.employeeId));
        if (subordinates.length > 0)
        {
          let subMinLimits: Map<string, number> = await this.getMinLimitTeam(member.employeeId, month);
          subMinLimits.forEach((value, key) => {
            teamMinLimits.set(key, value);
          });
        }
        // else
        // {
        //   teamMinLimits.set(member.username, await this.getMinLimit(member.employeeId, month));
        // }
      }
      // else
      // {
        teamMinLimits.set(member.username, await this.getMinLimit(member.employeeId, month));
      // }
    }
    // team.forEach(async member => {

    //   let subordinates: Employee[] = await firstValueFrom(this.getTeamMembers(member.employeeId));
    //   if (subordinates.length > 0)
    //   {
    //     let subMinLimits: Map<string, number> = await this.getMinLimitTeam(member.employeeId, month);
    //     subMinLimits.forEach((value, key) => {
    //       teamMinLimits.set(key, value);
    //     });
    //   }
    //   else
    //   {
    //     teamMinLimits.set(member.username, await this.getMinLimit(member.employeeId, month));
    //   }      
    // });
    return teamMinLimits;
  }

  async getMaxLimitTeam(manager_id: number, month: Date): Promise<Map<string, number>>
  {
    let team: Employee[] = await firstValueFrom(this.getTeamMembers(manager_id));
    let teamMaxLimits: Map<string, number> = new Map();
    for (const member of team) {
      if (member.levelRole !== 5 && member.levelRole !== 0)
      {
        let subordinates: Employee[] = await firstValueFrom(this.getTeamMembers(member.employeeId));
        if (subordinates.length > 0)
        {
          let subMaxLimits: Map<string, number> = await this.getMaxLimitTeam(member.employeeId, month);
          subMaxLimits.forEach((value, key) => {
            teamMaxLimits.set(key, value);
          });
        }
        // else
        // {
        //   teamMaxLimits.set(member.username, await this.getMaxLimit(member.employeeId, month));
        // }
      }
      // else
      // {
        teamMaxLimits.set(member.username, await this.getMaxLimit(member.employeeId, month));
      // }
    }
    // team.forEach(async member => {
    //   let subordinates: Employee[] = await firstValueFrom(this.getTeamMembers(member.employeeId));
    //   if (subordinates.length > 0)
    //   {
    //     let subMaxLimits: Map<string, number> = await this.getMaxLimitTeam(member.employeeId, month);
    //     subMaxLimits.forEach((value, key) => {
    //       teamMaxLimits.set(key, value);
    //     });
    //   }
    //   else
    //   {
    //     teamMaxLimits.set(member.username, await this.getMaxLimit(member.employeeId, month));
    //   }
    // });
    return teamMaxLimits;
  }

  async getSumOvertimeTeam(manager_id: number, month: Date): Promise<Map<string, number>>
  {
    let team: Employee[] = await firstValueFrom(this.getTeamMembers(manager_id));
    let teamRealOvertimes: Map<string, number> = new Map();
    for (const member of team) {
      if (member.levelRole !== 5 && member.levelRole !== 0)
      {
        let subordinates: Employee[] = await firstValueFrom(this.getTeamMembers(member.employeeId));
        if (subordinates.length > 0)
        {
          let subRealOvertimes: Map<string, number> = await this.getSumOvertimeTeam(member.employeeId, month);
          subRealOvertimes.forEach((value, key) => {
            teamRealOvertimes.set(key, value);
          });
        }
        // else
        // {
        //   teamRealOvertimes.set(member.username, await this.getSumOvertime(member.employeeId, month));
        // }
      }
      // else
      // {
        teamRealOvertimes.set(member.username, await this.getSumOvertime(member.employeeId, month));
      // }
    }
    // team.forEach(async member => {
    //   let subordinates: Employee[] = await firstValueFrom(this.getTeamMembers(member.employeeId));
    //   if (subordinates.length > 0)
    //   {
    //     let subRealOvertimes: Map<string, number> = await this.getSumOvertimeTeam(member.employeeId, month);
    //     subRealOvertimes.forEach((value, key) => {
    //       teamRealOvertimes.set(key, value);
    //     });
    //   }
    //   else
    //   {
    //     teamRealOvertimes.set(member.username, await this.getSumOvertime(member.employeeId, month)); // ak sa má zaratávať aj TL, len to dať preč z else
    //   }
    // });
    // console.log('Team real overtimes: ', teamRealOvertimes);
    return teamRealOvertimes;
  }

  async getMinLimitTeamSum(manager_id: number, month: Date): Promise<number>
  {
    let teamMinLimits: Map<string, number> = await this.getMinLimitTeam(manager_id, month);
    let sum: number = 0;
    teamMinLimits.forEach((value, key) => {
      sum += value;
    });
    return sum;
  }

  async getMaxLimitTeamSum(manager_id: number, month: Date): Promise<number>
  {
    let teamMaxLimits: Map<string, number> = await this.getMaxLimitTeam(manager_id, month);
    let sum: number = 0;
    teamMaxLimits.forEach((value, key) => {
      sum += value;
    });
    return sum;
  }

  async getSumOvertimeTeamSum(manager_id: number, month: Date): Promise<number>
  {
    let teamRealOvertimes: Map<string, number> = await this.getSumOvertimeTeam(manager_id, month);
    let sum: number = 0;
    teamRealOvertimes.forEach((value, key) => {
      sum += value;
    });
    return sum;
  }

  async getApproval(limit_id: number): Promise<boolean>
  {
    // return this.approvals.find(x => x.limit_id == limit_id)?.status_id === 'A';
    const limit: Approval = await firstValueFrom(this.http.get<Approval>(`${this.apiUrl}/Approval/limit_id?limit_id=${limit_id}`));
    return limit.statusId === 'A'
  }

  async getWorkflowActionsSchedules(): Promise<WorkflowActionSchedule[]>
  {
    return await firstValueFrom(this.http.get<WorkflowActionSchedule[]>(`${this.apiUrl}/WorkflowActionsSchedule`));
  }

  async getEmails(): Promise<Email[]>
  {
    return await firstValueFrom(this.http.get<Email[]>(`${this.apiUrl}/Email`));
  }

  async getScheduledJobs(): Promise<ScheduledJobs[]>
  {
    return await firstValueFrom(this.http.get<ScheduledJobs[]>(`${this.apiUrl}/ScheduledJobs`));
  }

  async getOvertimeTypes(): Promise<OvertimeType[]>
  {
    return await firstValueFrom(this.http.get<OvertimeType[]>(`${this.apiUrl}/OvertimeType`));
  }

  async setWfActionSchedule(action: WorkflowActionSchedule): Promise<void>
  {
    console.log('Setting action: ', action);
    await firstValueFrom(this.http.put(`${this.apiUrl}/WorkflowActionsSchedule`, action));
  }

  async setEmail(email: Email): Promise<void>
  {
    await firstValueFrom(this.http.put(`${this.apiUrl}/Email`, email));
  }

  async setScheduledJob(job: ScheduledJobs): Promise<void>
  {
    await firstValueFrom(this.http.put(`${this.apiUrl}/ScheduledJobs`, job));
  }

  async setOvertimeType(overtimeType: OvertimeType): Promise<void>
  {
    await firstValueFrom(this.http.put(`${this.apiUrl}/OvertimeType`, overtimeType));
  }

  async deleteWfActionSchedule(id: number): Promise<void>
  {
    try
    {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/WorkflowActionsSchedule?id=${id}`));
    }
    catch (error)
    {
      const errorMessage = (error as any).message || 'Unknown error';
      alert('Error deleting WF action: ' + errorMessage);
      // throw error; 
    }
  }

  async deleteEmail(id: number): Promise<void>
  {
    try
    {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/Email?id=${id}`));
    }
    catch (error)
    {
      const errorMessage = (error as any).message || 'Unknown error';
      alert('Error deleting email: ' + errorMessage);
      // throw error;
    }
  }

  async deleteScheduledJob(id: number): Promise<void>
  {
    console.log('Deleting job: ', id);
    try
    {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/ScheduledJobs?id=${id}`));
    }
    catch (error)
    {
      const errorMessage = (error as any).message || 'Unknown error';
      alert('Error deleting scheduled job: ' + errorMessage);
      // throw error;
    }
  }

  async deleteOvertimeType(id: number): Promise<void>
  {
    try
    {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/OvertimeType?id=${id}`));
    }
    catch (error)
    {
      const errorMessage = (error as any).message || 'Unknown error';
      alert('Error deleting overtime type: ' + errorMessage);
      // throw error;
    }
  }

  async postWfActionSchedule(action: WorkflowActionSchedule): Promise<void>
  {
    await firstValueFrom(this.http.post(`${this.apiUrl}/WorkflowActionsSchedule`, action));
  }

  async postEmail(email: Email): Promise<void>
  {
    await firstValueFrom(this.http.post(`${this.apiUrl}/Email`, email));
  }

  async postScheduledJob(job: ScheduledJobs): Promise<void>
  {
    console.log('Posting job: ', job);
    if (!(job.lastExecutionDate instanceof Date))
    {
      if (job.lastExecutionDate) 
      {
        job.lastExecutionDate = new Date(job.lastExecutionDate);
      }

      if (job.lastExecutionDate?.toString() == '')
      {
        job.lastExecutionDate = undefined;
      }
    }
    console.log('Posting job: ', job);
    await firstValueFrom(this.http.post(`${this.apiUrl}/ScheduledJobs`, job));
  }

  async postOvertimeType(overtimeType: OvertimeType): Promise<void>
  {
    await firstValueFrom(this.http.post(`${this.apiUrl}/OvertimeType`, overtimeType));
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

  getAssistantUsername(): Observable<string | null>
  {
    return of(this.assistantUsername);
  }

  getOvertimeChanges(): Observable<Map<string, number>> {
    return this.overtimeSubject.asObservable();
  }
}
