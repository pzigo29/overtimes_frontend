import { TitleBarComponent } from '../title-bar/title-bar.component';
import { EmployeeFilterService } from '../../../services/employee-filter.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, Input, numberAttribute, booleanAttribute, Output, EventEmitter } from '@angular/core'; 
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Employee } from '../../../models/data.model';
import { DataService } from '../../../services/data.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-user-filters',
    standalone: true,
    imports: [FormsModule, CommonModule, TranslateModule],
    templateUrl: './employee-filters.component.html',
    styleUrl: './employee-filters.component.scss'
})
export class EmployeeFiltersComponent {
  @Output() filteredEmployees = new EventEmitter<Employee[]>();
  @Input() minLimits: Map<string, number> = new Map<string, number>();
  @Input() maxLimits: Map<string, number> = new Map<string, number>();
  @Input() realOvertimes: Map<string, number> = new Map<string, number>();
  @Input() employees: Employee[] = [];

  constructor(private employeeFilterService: EmployeeFilterService, private dataService: DataService, private translate: TranslateService) { }

  ngOnInit(): void 
  {
    this.dataService.getDepartments().subscribe(
      (data: string[]) => {
        console.log(data);
        this.departments = data;
      },
      (error: any) => {
        console.error('Error fetching departments:', error);
      }
    );  
  }

  filter: string = 'all';
  personalNumber: string | null = null;
  managerUsername: string | null = null;
  dSegment: string | null = null;
  username: string | null = null;
  showFilters: boolean = false;
  departments: string[] = [];
  lastName: string | null = null;
  firstName: string | null = null;

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  resetFilters(): void {
    this.filter = 'all';
    this.personalNumber = null;
    this.managerUsername = null;
    this.dSegment = null;
    this.username = null;
    this.lastName = null;
    this.firstName = null;
    (document.getElementById('departmentsSelect') as HTMLSelectElement).selectedIndex = 0;
    this.filteredEmployees.emit(this.employees);
  }

  async setDSegment(): Promise<void>
  {
    const segmentElement = document.getElementById('departmentsSelect') as HTMLSelectElement;
    let segmentValue = segmentElement.value;

    this.dSegment = segmentValue === 'ALL' ? '' : segmentValue;
  }

  async filterEmployees(): Promise<void> {
    let filteredEmployees = this.employees;

    await this.setDSegment();
    
    if (this.filter === 'overtime-off-limit') {
      filteredEmployees = this.employeeFilterService.filterEmployeesByOvertimeOffLimit(this.minLimits, this.maxLimits, this.realOvertimes, filteredEmployees);
    } else if (this.filter === 'overtime-in-limit') {
      filteredEmployees = this.employeeFilterService.filterEmployeesByOvertimeInLimit(this.minLimits, this.maxLimits, this.realOvertimes, filteredEmployees);
    }

    if (this.personalNumber) {
      filteredEmployees = this.employeeFilterService.filterEmployeesByPersonalNumber(filteredEmployees, this.personalNumber);
    }

    if (this.managerUsername) {
      
      let manager: Employee | undefined = this.employees.find(employee => employee.username === this.managerUsername);
      if (manager)
      {
        console.log('in managerUsername: ', this.managerUsername);
        filteredEmployees = this.employeeFilterService.filterEmployeesByManager(filteredEmployees, manager);
      }
    }

    if (this.dSegment) {
      filteredEmployees = this.employeeFilterService.filterBySegment(filteredEmployees, this.dSegment);
    }

    if (this.username) {
      filteredEmployees = this.employeeFilterService.filterEmployeesByUserName(filteredEmployees, this.username);
    }

    if (this.lastName) {
      filteredEmployees = this.employeeFilterService.filterByLastName(filteredEmployees, this.lastName);
    }

    if (this.firstName) {
      filteredEmployees = this.employeeFilterService.filterByFirstName(filteredEmployees, this.firstName);
    }

    this.filteredEmployees.emit(filteredEmployees);
  }

  isSidebarActive(): boolean {
    return TitleBarComponent.isSidebarActive;
  }

  isSidebarVisible(): boolean {
    return TitleBarComponent.isSidebarVisible;
  }
}
