import { Injectable, OnInit } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
import { of, Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { Approval, Email, Employee, MonthOvertime, NonFulfilledOvertimes, Overtime, OvertimeLimit, OvertimeLimitRequest, OvertimeType, ScheduledJobs, WorkflowActionSchedule } from '../models/data.model';
import { error } from 'node:console';
import { HttpClient } from '@angular/common/http';
import * as os from 'os';
import { endOfMonth, isBefore, startOfMonth } from 'date-fns';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private overtimeSubject = new BehaviorSubject<Map<string, number>>(new Map<string, number>());
  private selectedMonthSubject = new BehaviorSubject<Date>(new Date());
  private usernameSubject = new BehaviorSubject<string>('');
  private initializationSubject = new BehaviorSubject<boolean>(false);
  overtime$ = this.overtimeSubject.asObservable();
  selectedMonth$ = this.selectedMonthSubject.asObservable();
  username$ = this.usernameSubject.asObservable();
  initialization$ = this.initializationSubject.asObservable();

  // const os = require('os');
  // username: string = os.userInfo().username;

  private usernameKey: string = 'username';

  username: string = ''; // toto sa bude načítavať z windowsu
  rndUsername: string = '';
  mngUsername: string | null = this.username;
  tlUsername: string | null = this.username;
  thpUsername: string | null = this.username;
  assistantUsername: string | null = this.username;
  // assistantUsername: string | null = 'mikimaja';
  selectedEmployee?: Employee;
  userEmployee?: Employee;

  initialized: boolean = false;

  // private apiUrl = 'https://localhost:7198/api';
  private apiUrl = 'http://localhost:5001/api';

  constructor(private http: HttpClient, private localStorage: LocalStorageService) 
  {
    // this.username = os.userInfo().username;
    const savedUsername = this.localStorage.getItem(this.usernameKey);
    const initialUsername = savedUsername ?? 'defaultUsername';
    this.usernameSubject.next(initialUsername);

    this.usernameSubject.subscribe((username) => {
      if (username) {
        this.username = username;
        console.log('Username found:', this.username);
      } else {
        console.log('No username found');
      }
    });
    
    this.initUserEmployee();

    this.initializeService();
  } 

  setUsername(newUsername: string): void {
    // this.username = newUsername;
    this.usernameSubject.next(newUsername);
    this.localStorage.setItem(this.usernameKey, newUsername);
    console.log('Username updated to:', this.username);
  }

  private initUserEmployee(): void
  {
    this.username$.subscribe((username) => {
      if (username) {
        this.getEmployee(this.username).subscribe(
          (data: Employee | undefined) => {
            this.userEmployee = data;
            console.log('userEmployee: ' + this.userEmployee?.username);
            console.log(this.initialized);
            this.rndUsername = this.userEmployee?.levelRole === 1 ? this.userEmployee.username : '';
            this.mngUsername = this.username;
            this.tlUsername = this.username;
            this.thpUsername = this.username;
            this.assistantUsername = this.username;
            console.log('username is: ' + this.username);
            console.log('mngUsername is: ' + this.mngUsername);
            console.log('tlUsername is: ' + this.tlUsername);
            console.log('rndUsername is: ' + this.rndUsername);

            this.initialized = true;
          },
          (error: any) => {
            console.error('Error fetching userEmployee', error);
          }
        );
        this.rndUsername = this.userEmployee?.levelRole === 1 ? this.userEmployee.username : '';
        
      }
      
    })
  }

  private async initializeService(): Promise<void>
  {
    this.initializationSubject.next(true);
    this.initializationSubject.complete();
  }

  isPastMonth(month: Date): boolean
  {
    const today = new Date();
    return isBefore(endOfMonth(month), startOfMonth(today));
  }

  async isPastDeadline(): Promise<boolean>
  {
    console.log('isPastDeadline');
    return await firstValueFrom(this.http.get<boolean>(`${this.apiUrl}/WorkflowActionsSchedule/IsPastTHPDeadline`));
    // return true;
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

  getEmployee(username: string): Observable<Employee | undefined> {
    console.log('am i getting employee??' , username);
    return this.http.get<Employee>(`${this.apiUrl}/Employee/${username}`);
  }

  async getAllUsernames(): Promise<string[]>
  {
    return await firstValueFrom(this.http.get<string[]>(`${this.apiUrl}/Employee/usernames`));
  }

  async getEmployeeByPersonalNumber(personalNumber: string): Promise<Employee | undefined>
  {
    return await firstValueFrom(this.http.get<Employee>(`${this.apiUrl}/Employee/pn/${personalNumber}`));
  }

  getEmployeeById(employeeId: number): Observable<Employee | undefined>
  {
    return this.http.get<Employee>(`${this.apiUrl}/Employee/Id?employeeId=${employeeId}`);
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

  getRndMng(): Observable<Employee>
  {
    return this.http.get<Employee>(`${this.apiUrl}/Employee/RndMng`);
  }

  getEmployees(): Observable<Employee[]>
  {
    // return of(this.employees);
    return this.http.get<Employee[]>(`${this.apiUrl}/Employee`);
  }

  getDepartments(managerId?: number): Observable<string[]>
  {
    if (managerId != undefined)
      return this.http.get<string[]>(`${this.apiUrl}/Employee/Departments?managerId=${managerId}`);
    return this.http.get<string[]>(`${this.apiUrl}/Employee/Departments`);
  }

  async getDepartmentAverage(filter: string, date: string, department?: string): Promise<number>
  {
    return await firstValueFrom(this.http.get<number>(`${this.apiUrl}/Overtime/GetAverageOvertime?department=${department}&filter=${filter}&date=${date}`));
  }

  async getEmployeeAverage(personalNumbers: string, filter: string, date: string): Promise<number>
  {
    // let numbersApiString: string = '';
    // for (const persNumber of personalNumbers)
    // {
    //   numbersApiString += 'personalNumbers=' + persNumber + '&';
    // }
    // personalNumbers.forEach(number => {
    //   numbersApiString += 'personalNumbers=' + number + '&';
    // });
    // console.log('NumbersApiString: ', numbersApiString);
    return await firstValueFrom(this.http.get<number>(`${this.apiUrl}/Overtime/GetAverageOvertime?personalNumbers=${personalNumbers}&filter=${filter}&date=${date}`));
  }

  async getHierarchy(managerId: number): Promise<Employee[]>
  {
    return await firstValueFrom(this.http.get<Employee[]>(`${this.apiUrl}/Approval/GetEmployeesInHierarchy?managerId=${managerId}`));
  }

  // async getNonFulfilledLimits(date: string, managerId?: number): Promise<NonFulfilledOvertimes>
  // {
  //   if (managerId != null)
  //   {
  //     console.log('mngId:', managerId);
  //     return await firstValueFrom(this.http.get<NonFulfilledOvertimes>(`${this.apiUrl}/Employee/NonFulfilledOvertimes?month=${date}&managerId=${managerId}`));
  //   }
  //   return await firstValueFrom(this.http.get<NonFulfilledOvertimes>(`${this.apiUrl}/Employee/NonFulfilledOvertimes?month=${date}`));
  // }

  async getNonFulfilledLimits(date: string, department?: string): Promise<NonFulfilledOvertimes>
  {
    if (department != null)
    {
      console.log('department:', department);
      return await firstValueFrom(this.http.get<NonFulfilledOvertimes>(`${this.apiUrl}/Employee/NonFulfilledOvertimes?month=${date}&department=${department}`));
    }
    return await firstValueFrom(this.http.get<NonFulfilledOvertimes>(`${this.apiUrl}/Employee/NonFulfilledOvertimes?month=${date}`));
  }

  async getExceededLawLimits(date: string, limit: number, department?: string): Promise<NonFulfilledOvertimes>
  {
    if (department != null)
    {
      console.log('department:', department);
      return await firstValueFrom(this.http.get<NonFulfilledOvertimes>(`${this.apiUrl}/Employee/ExceededRuleLimits?year=${date}&department=${department}&ruleLimit=${limit}`));
    }
    return await firstValueFrom(this.http.get<NonFulfilledOvertimes>(`${this.apiUrl}/Employee/ExceededRuleLimits?year=${date}&ruleLimit=${limit}`));
  }

  async getCustomTimeOvertimes(startDate: string, endDate: string, personalNumber?: string, department?: string): Promise<Overtime[]>
  {
    if (personalNumber != undefined)
    {
      console.log('personalNumber:', personalNumber);
      return await firstValueFrom(this.http.get<Overtime[]>(`${this.apiUrl}/Overtime/CustomRangeOvertimes?startDate=${startDate}&endDate=${endDate}&personalNumber=${personalNumber}`));
    }
    if (department != undefined)
    {
      console.log('department:', department);
      return await firstValueFrom(this.http.get<Overtime[]>(`${this.apiUrl}/Overtime/CustomRangeOvertimes?startDate=${startDate}&endDate=${endDate}&department=${department}`));
    }
    return await firstValueFrom(this.http.get<Overtime[]>(`${this.apiUrl}/Overtime/CustomRangeOvertimes?startDate=${startDate}&endDate=${endDate}`));
  }

  async getMaxMonthOvertimes(year: number): Promise<MonthOvertime>
  {
    return await firstValueFrom(this.http.get<MonthOvertime>(`${this.apiUrl}/Overtime/MaxMonthOvertimes?year=${year}`));
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

  async getLimitReason(employee_id: number, month: Date): Promise<string>
  {
    // let limit = this.limits.find(x => x.employee_id === employee_id && this.compareYearAndMonth(x.start_date, month))?.max_hours
    const limit: OvertimeLimit = await firstValueFrom(this.http.get<OvertimeLimit>(`${this.apiUrl}/OvertimeLimit/employee_id?employeeId=${employee_id}&month=${typeof month === 'string' ? month : month.toDateString()}`));
    if (limit == undefined || limit == null)
    {
      //throw new Error('Limit was not found! ' + employee_id);
      return '';
    }
    return limit.reason || '';
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

  // async setApprovedStatusHierarchy(manager_id: number, )

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
      if (comment === undefined || comment === null || comment === '')
      {
        await firstValueFrom(this.http.post(`${this.apiUrl}/Approval/PostApprovalByLimit?limitId=${limit.limitId}&approverId=${approverId}&approvalStatus=${status}`, null));
      }
      else
      {
        await firstValueFrom(this.http.post(`${this.apiUrl}/Approval/PostApprovalByLimit?limitId=${limit.limitId}&approverId=${approverId}&comment=${comment}&approvalStatus=${status}`, null));
      }
   }
    catch (error)
    {
      console.error('Error setting approved status: ', error);
      throw error;
    }
  }

  async postApprovalsByManager(managerId: number, month: Date, status: string): Promise<void>
  {
    try
    {
      const monthString: string = typeof month === 'string' ? month : month.toDateString();
      await firstValueFrom(this.http.post(`${this.apiUrl}/Approval/PostApprovalsByManager?managerId=${managerId}&month=${monthString}&status=${status}`, null));
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

  async postLimitRequest(employee_id: number, month: Date, min_hours: number, max_hours: number, reason: string | null): Promise<void>
  {
    try
    {
      const request: OvertimeLimitRequest = 
      {
        requestId: 0,
        employeeId: employee_id,
        minHours: min_hours,
        maxHours: max_hours,
        startDate: month,
        endDate: new Date(month.getFullYear(), month.getMonth() + 1, 0),
        reason: reason
      }
      await firstValueFrom(this.http.post(`${this.apiUrl}/OvertimeLimitRequest/PostLimitRequest`, request));
    }
    catch (error)
    {
      console.error('Error setting limit:', error);
      throw error;
    }
  }

  async getMinLimitTeam(manager_id: number, month: Date): Promise<Map<string, number>>
  {
    let team: Employee[] = await firstValueFrom(this.getTeamMembers(manager_id));
    let manager: Employee | undefined = await firstValueFrom(this.getEmployeeById(manager_id));
    let teamMinLimits: Map<string, number> = new Map();
    if (manager)
    {
      teamMinLimits.set(manager?.username, await this.getMinLimit(manager_id, month));
    }
    for (const member of team) {
      if (member.levelRole !== 5 && member.levelRole !== 0)
      {
        let subordinates: Employee[] = await firstValueFrom(this.getTeamMembers(member.employeeId));
        if (subordinates.length > 0)
        {
          let subMinLimits: Map<string, number> = await this.getMinLimitTeam(member.employeeId, month);
          subMinLimits.forEach((value, key) => {
            teamMinLimits.set(key, value);
          });
        }
      }
      teamMinLimits.set(member.username, await this.getMinLimit(member.employeeId, month));
    }
    return teamMinLimits;
  }

  async getMaxLimitTeam(manager_id: number, month: Date): Promise<Map<string, number>>
  {
    let team: Employee[] = await firstValueFrom(this.getTeamMembers(manager_id));
    let manager: Employee | undefined = await firstValueFrom(this.getEmployeeById(manager_id));
    let teamMaxLimits: Map<string, number> = new Map();
    if (manager)
    {
      teamMaxLimits.set(manager?.username, await this.getMaxLimit(manager_id, month));
    }
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
      }
      teamMaxLimits.set(member.username, await this.getMaxLimit(member.employeeId, month));
    }
    return teamMaxLimits;
  }

  async getSumOvertimeTeam(manager_id: number, month: Date): Promise<Map<string, number>>
  {
    let team: Employee[] = await firstValueFrom(this.getTeamMembers(manager_id));
    let manager: Employee | undefined = await firstValueFrom(this.getEmployeeById(manager_id));
    let teamRealOvertimes: Map<string, number> = new Map();
    if (manager)
    {
      teamRealOvertimes.set(manager?.username, await this.getSumOvertime(manager_id, month));
    }
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
      }
      teamRealOvertimes.set(member.username, await this.getSumOvertime(member.employeeId, month));
    }
    return teamRealOvertimes;
  }

  async getApprovedStatusHierarchy(managerIds: number[], month: Date): Promise<Map<string, boolean>>
  {
    let approvedStatuses: Map<string, boolean> = new Map;
    for (const managerId of managerIds)
    {
      let approvedStatus: boolean = await this.getApprovedStatusManager(managerId, month);
      const employee = await firstValueFrom(this.getEmployeeById(managerId));
      if (employee) {
        approvedStatuses.set(employee.username, approvedStatus);
      }
    }
    return approvedStatuses;
  }

  async getApprovedStatusManager(managerId: number, month: Date): Promise<boolean>
  {
    try
    {
      return await firstValueFrom(this.http.get<boolean>(`${this.apiUrl}/Approval/GetApprovalsByManager?managerId=${managerId}&month=${typeof month === 'string' ? month : month.toDateString()}`));
    }
    catch (error)
    {
      console.error('Error fetching approved status: ', error);
      // throw error;
    }
    return false;
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

  async getNotNullYears(employeeId: number): Promise<number[]>
  {
    return await firstValueFrom(this.http.get<number[]>(`${this.apiUrl}/Overtime/NotNullYears?employeeId=${employeeId}`));
  }

  async getSumOvertimesYear(employeeId: number, year: number): Promise<number>
  {
    return await firstValueFrom(this.http.get<number>(`${this.apiUrl}/Overtime/SumOvertimesYear?year=${year}&employeeId=${employeeId}`));
  }

  async getRequestCount(employeeId: number, month: Date): Promise<number>
  {
    if (typeof month === 'string')
    {
      month = new Date(month);
    }
    console.log('Request count: ', employeeId, month);
    return await firstValueFrom(this.http.get<number>(`${this.apiUrl}/OvertimeLimitRequest/RequestCount?employeeId=${employeeId}&month=${month.getFullYear()}-${month.getMonth() + 1}`));
  }

  async getRequests(employeeId: number, month: Date): Promise<OvertimeLimitRequest[]>
  {
    if (typeof month === 'string')
    {
      month = new Date(month);
    }
    return await firstValueFrom(this.http.get<OvertimeLimitRequest[]>(`${this.apiUrl}/OvertimeLimitRequest/Requests?employeeId=${employeeId}&month=${month.getFullYear()}-${month.getMonth() + 1}`));
  }
}
