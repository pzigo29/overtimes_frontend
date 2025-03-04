import { Component, OnInit } from '@angular/core';
import { TitleBarComponent } from "../../shared-components/title-bar/title-bar.component";
import { Employee } from '../../../models/data.model';
import { DataService } from '../../../services/data.service';
import { Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { MonthsTableComponent } from "../../shared-components/months-table/months-table.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-overtime-tl-team-detail',
    standalone: true,
    imports: [TitleBarComponent, FormsModule, CommonModule, MonthsTableComponent, TranslateModule],
    templateUrl: './overtime-tl-team-detail.component.html',
    styleUrl: './overtime-tl-team-detail.component.scss'
})
export class OvertimeTLTeamDetailComponent implements OnInit {
  title: string = 'TL-TEAM-DETAIL';
  selectedEmployee?: Employee;
  minLimit: number = 0;
  maxLimit: number = 0;
  realOvertime: number = 0;
  selectedMonth: Date = new Date();

  constructor(private dataService: DataService, private router: Router, private location: Location) {}

  ngOnInit(): void {
    if (typeof sessionStorage !== 'undefined') 
    {
      const savedEmployee = sessionStorage.getItem('selectedEmployee');
      if (savedEmployee) {
        this.selectedEmployee = JSON.parse(savedEmployee);
        console.log('Loaded employee from session storage:', this.selectedEmployee);
        this.setData();
      }
    }
    else 
    {
      console.warn('Session storage is not available');
    }

    this.dataService.getSelectedEmployee().subscribe(
      (data: Employee | undefined) => {
        this.selectedEmployee = data;
        if (data) {
          sessionStorage.setItem('selectedEmployee', JSON.stringify(data));
          console.log('Saved employee to local storage:', data);
          this.setData();
        } else {
          console.log('No employee data received');
        }
      },
      (error: any) => {
        console.error('Error fetching employee', error);
      }
    );

    this.dataService.selectedMonth$.subscribe(
      (data: Date) => {
        this.selectedMonth = data;
        if (this.selectedEmployee) {
          this.setData();
        } else {
          console.log('No selected employee to set data for');
        }
      }
    );
  }

  selectEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    if (typeof sessionStorage !== 'undefined')
    {
      sessionStorage.setItem('selectedEmployee', JSON.stringify(employee));
    }
    else
    {
      console.warn('Session storage is not available');
    }
    console.log('Selected employee:', employee);
    this.setData();
  }

  async setData()
  {
    if (!this.selectedEmployee) {
      console.error('Employee is undefined');
      return;
    }
    console.log('Setting data for employee:', this.selectedEmployee);
    this.minLimit = await this.dataService.getMinLimit(this.selectedEmployee.employeeId, this.selectedMonth);
    this.maxLimit = await this.dataService.getMaxLimit(this.selectedEmployee.employeeId, this.selectedMonth);
    this.realOvertime = await this.dataService.getSumOvertime(this.selectedEmployee.employeeId, this.selectedMonth);
  }

  async saveLimits(): Promise<void>
  {
    await this.dataService.setLimit(this.selectedEmployee?.employeeId || 0, this.selectedMonth, this.minLimit, this.maxLimit);
  }

  getOvertimeStatus(employee: Employee): string {
    if (this.realOvertime < this.minLimit) {
      return 'low-value';
    } else if (this.realOvertime + (this.maxLimit * 0.1) > this.maxLimit) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }

  showSite(site: string): void {
    this.router.navigate([`${site}`]);
  }

  goBack(): void
  {
    this.location.back();
  }
}
