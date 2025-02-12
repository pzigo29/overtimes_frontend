import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { Employee } from "../models/data.model"
import { UserFilterService } from "../services/user-filter.service";
import { UserFiltersComponent } from "../user-filters/user-filters.component";
import { MonthsTableComponent } from "../months-table/months-table.component";
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-overtime-assistant',
  standalone: true,
  imports: [TitleBarComponent, CommonModule, FormsModule, UserFiltersComponent, MonthsTableComponent, TranslateModule],
  templateUrl: './overtime-assistant.component.html',
  styleUrl: './overtime-assistant.component.scss'
})
export class OvertimeAssistantComponent implements OnInit{
  title: string = 'RND';
  loading: boolean = true;
  isTableVisible: boolean = true;
  employees: Employee[] = [];
  employeesRealOvertimes: Map<string, number> = new Map<string, number>();
  employeesMinLimits: Map<string, number> = new Map<string, number>();
  employeesMaxLimits: Map<string, number> = new Map<string, number>();
  assistant?: Employee;
  selectedMonth: Date = new Date();
  // realOvertimeSum: number = 0;
  // minOvertimeSum: number = 0;
  // maxOvertimeSum: number = 0;

  constructor(private userFilterService: UserFilterService, private dataService: DataService) { }

  ngOnInit(): void 
    {
      let username = '';
      this.dataService.getAssistantUsername().subscribe(
        (data: string | null) => {
          if (data !== null)
            username = data;
        }
      );
      if (username !== '')
      {
        this.dataService.getEmployee(username).subscribe(
          (data: Employee | undefined) => {
            this.assistant = data;
            if (this.assistant === undefined) {
              this.loading = true;
              throw new Error('Employee undefined' + username);
            }
            console.log(this.assistant);
            // this.setData();
            this.loading = false;  // Set to false when data is fully loaded
            //console.log(this.employee.username);
          },
          (error: any) => {
              this.loading = false;
              console.error('Error fetching employee', error);
          }
        );
        if (this.assistant != undefined && this.assistant.levelRole === 0)
        {
          this.dataService.getEmployees().subscribe(
            (data: Employee[]) =>
            {
              this.employees = data;
              console.log('team member 0: ', this.employees[0]);
              this.setData();
            }
          );
          for (let i = 0; i < this.employees.length; i++)
          {
            this.employeesRealOvertimes.set(this.employees[i].username, 0);
            this.employeesMinLimits.set(this.employees[i].username, 0);   
            this.employeesMaxLimits.set(this.employees[i].username, 0);  
          }
        }
        this.dataService.selectedMonth$.subscribe(
          month => {
            this.loading = true;
            this.selectedMonth = month;
            this.setData();
            this.loading = false;
          }
        );
      }
      else
      {
        this.loading = true;
      }
    }
  
  getOvertimeStatus(employee: Employee): string 
  {
    //console.log('Overtime status: ', this.realOvertime);
    
    if ((this.employeesRealOvertimes.get(employee.username) || 0) < (this.employeesMinLimits.get(employee.username) || 0)) {
      return 'low-value';
    } else if ((this.employeesRealOvertimes.get(employee.username) || 0) + ((this.employeesMaxLimits.get(employee.username) || 0) * 0.1) > (this.employeesMaxLimits.get(employee.username) || 0)) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }

  selectEmployee(employee: Employee): void 
  {
    // this.selectedEmployee = employee;
    // this.router.navigate(['/employee', employee.username]);
  }

  setData(): void
  {
    if (this.assistant == undefined)
      throw new Error('Assistant undefined');
    this.employees.forEach(async employee => {
      let overtimes = await this.dataService.getSumOvertime(employee.employeeId, this.selectedMonth);
      let minLimit = await this.dataService.getMinLimit(employee.employeeId, this.selectedMonth);
      let maxLimit = await this.dataService.getMaxLimit(employee.employeeId, this.selectedMonth);
      this.employeesRealOvertimes.set(employee.username, overtimes);
      this.employeesMinLimits.set(employee.username, minLimit);
      this.employeesMaxLimits.set(employee.username, maxLimit);
    });
  }
  
  // userFilterComponent: UserFiltersComponent;
  // users: User[];

  // newUser: User = {
  //   personUserName: 'janono',
  //   firstName: '',
  //   lastName: '',
  //   personalNumber: '312165489',
  //   costCenter: '0045-1709',
  //   overtimeMaxLimit: 40,
  //   overtimeMinLimit: 5,
  //   realOvertime: 10.46,
  //   manager: null,
  //   dSegment: '3'
  // };

  
  // constructor() {
  //   this.userFilterComponent = new UserFiltersComponent(new UserFilterService);
  //   this.users = this.userFilterComponent.users;
    
  //   this.users.push(this.newUser);
  // }

  

  // filter: string = 'all';
  // personalNumber: string | null = null;
  // manager: User | null = null;
  // dSegment: string | null = null;
  // username: string | null = null;
  // showFilters: boolean = false;

  // toggleFilters(): void {
  //   this.showFilters = !this.showFilters;
  // }

  // resetFilters(): void {
  //   this.filter = 'all';
  //   this.personalNumber = null;
  //   this.manager = null;
  //   this.dSegment = null;
  //   this.username = null;
  // }

  

  // filterUsers(): User[] {
  //   let filteredUsers = this.users;

  //   if (this.filter === 'overtime-off-limit') {
  //     filteredUsers = this.userFilterService.filterUsersByOvertimeOffLimit(filteredUsers);
  //   } else if (this.filter === 'overtime-in-limit') {
  //     filteredUsers = this.userFilterService.filterUsersByOvertimeInLimit(filteredUsers);
  //   }

  //   if (this.personalNumber) {
  //     filteredUsers = this.userFilterService.filterUsersByPersonalNumber(filteredUsers, this.personalNumber);
  //   }

  //   if (this.manager) {
  //     filteredUsers = this.userFilterService.filterUsersByManager(filteredUsers, this.manager);
  //   }

  //   if (this.dSegment) {
  //     filteredUsers = this.userFilterService.filterUsersByDSegment(filteredUsers, this.dSegment);
  //   }

  //   if (this.username) {
  //     filteredUsers = this.userFilterService.filterUsersByUserName(filteredUsers, this.username);
  //   }

  //   return filteredUsers;
  //   // this.users = this.userFilterComponent.filterUsers();
  //   // this.userFilterComponent.filter = this.filter;
  //   // return this.userFilterComponent.filterUsers();
  // }

  

  isSidebarActive(): boolean {
    return TitleBarComponent.isSidebarActive;
  }

  isSidebarVisible(): boolean {
    return TitleBarComponent.isSidebarVisible;
  }

}
