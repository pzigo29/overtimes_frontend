import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { Employee } from "../models/data.model"
import { EmployeeFilterService } from "../services/employee-filter.service";
import { EmployeeFiltersComponent } from "../employee-filters/employee-filters.component";
import { MonthsTableComponent } from "../months-table/months-table.component";
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-overtime-assistant',
  standalone: true,
  imports: [TitleBarComponent, CommonModule, FormsModule, EmployeeFiltersComponent, MonthsTableComponent, TranslateModule],
  templateUrl: './overtime-assistant.component.html',
  styleUrl: './overtime-assistant.component.scss'
})
export class OvertimeAssistantComponent implements OnInit{
  title: string = 'RND';
  loading: boolean = true;
  isTableVisible: boolean = true;
  allEmployees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  employeesRealOvertimes: Map<string, number> = new Map<string, number>();
  employeesMinLimits: Map<string, number> = new Map<string, number>();
  employeesMaxLimits: Map<string, number> = new Map<string, number>();
  assistant?: Employee;
  selectedMonth: Date = new Date();
  // realOvertimeSum: number = 0;
  // minOvertimeSum: number = 0;
  // maxOvertimeSum: number = 0;

  constructor(private userFilterService: EmployeeFilterService, private dataService: DataService) { }

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
              this.filteredEmployees = data;
              this.allEmployees = this.filteredEmployees;
              console.log('team member 0: ', this.filteredEmployees[0]);
              this.setData();
            }
          );
          for (let i = 0; i < this.filteredEmployees.length; i++)
          {
            this.employeesRealOvertimes.set(this.filteredEmployees[i].username, 0);
            this.employeesMinLimits.set(this.filteredEmployees[i].username, 0);   
            this.employeesMaxLimits.set(this.filteredEmployees[i].username, 0);  
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
    this.filteredEmployees.forEach(async employee => {
      let overtimes = await this.dataService.getSumOvertime(employee.employeeId, this.selectedMonth);
      let minLimit = await this.dataService.getMinLimit(employee.employeeId, this.selectedMonth);
      let maxLimit = await this.dataService.getMaxLimit(employee.employeeId, this.selectedMonth);
      this.employeesRealOvertimes.set(employee.username, overtimes);
      this.employeesMinLimits.set(employee.username, minLimit);
      this.employeesMaxLimits.set(employee.username, maxLimit);
    });
  }

  isSidebarActive(): boolean {
    return TitleBarComponent.isSidebarActive;
  }

  isSidebarVisible(): boolean {
    return TitleBarComponent.isSidebarVisible;
  }

  onFilteredEmployees(filteredEmployees: Employee[]): void {
    this.filteredEmployees = filteredEmployees;
    // this.recalculateSums();
  }

}
