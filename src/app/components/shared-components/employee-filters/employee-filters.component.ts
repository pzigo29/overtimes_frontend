import { TitleBarComponent } from '../title-bar/title-bar.component';
import { EmployeeFilterService } from '../../../services/employee-filter.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, Input, numberAttribute, booleanAttribute, Output, EventEmitter } from '@angular/core'; 
import { TranslateModule } from '@ngx-translate/core';
import { Employee } from '../../../models/data.model';

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

  constructor(private employeeFilterService: EmployeeFilterService) { }
  
  filter: string = 'all';
  personalNumber: string | null = null;
  managerUsername: string | null = null;
  dSegment: string | null = null;
  username: string | null = null;
  showFilters: boolean = false;

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  resetFilters(): void {
    this.filter = 'all';
    this.personalNumber = null;
    this.managerUsername = null;
    this.dSegment = null;
    this.username = null;
    this.filteredEmployees.emit(this.employees);
  }

  filterEmployees(): void {
    let filteredEmployees = this.employees;
    
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
      // filteredUsers = this.userFilterService.filterUsersByDSegment(filteredUsers, this.dSegment);
    }

    if (this.username) {
      filteredEmployees = this.employeeFilterService.filterEmployeesByUserName(filteredEmployees, this.username);
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
