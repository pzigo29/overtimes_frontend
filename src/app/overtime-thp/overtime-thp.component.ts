import { ChangeDetectorRef, Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { MonthsTableComponent } from "../months-table/months-table.component";
import { Employee, Overtime, OvertimeLimit } from '../models/data.model';
import { DataService } from '../services/data.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-overtime-thp',
  standalone: true,
  imports: [FormsModule, CommonModule, TitleBarComponent, MonthsTableComponent, TranslateModule],
  templateUrl: './overtime-thp.component.html',
  styleUrl: './overtime-thp.component.scss'
})

export class OvertimeThpComponent implements OnInit {
  title: string = 'Moje nadčasy';
  employee?: Employee;
  isTableVisible: boolean = true;
  realOvertime: number = 0;
  minOvertime: number = 0;
  maxOvertime: number = 0;
  approved: boolean = false; //this.dataService.getApproval(limit_id);
  loading: boolean = true;
  selectedMonth: Date = new Date();

  name: string = '';

  constructor(private dataService: DataService, private cd: ChangeDetectorRef) { }

  async ngOnInit() {
    this.loading = true; // Start loading state
    try {
      let username: string | null = null;
      await this.dataService.getThpUsername().subscribe(
        (data: string | null) =>
        {
          username = data;
        }
      ); // Wait for the username to be fetched
      
      if (username) {
        console.log('Fetched username:', username);
        await this.dataService.getEmployee(username).subscribe(
          (data: Employee | undefined) =>
          {
            this.employee = data;
          }
        ); // Wait for employee data to be fetched
        this.cd.detectChanges();
        console.log('Employee received from service:', this.employee);
        this.name = this.employee?.firstName || '';
        if (this.employee) {
          this.setData(); // Now we are sure that the employee is not undefined
        } else {
          console.error('Employee is undefined for username:', username);
        }
      } else {
        console.error('No username found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.loading = false; // End loading state
    }

    // Subscribe to the selectedMonth$ 
    this.dataService.selectedMonth$.subscribe(month => {
      if (this.employee) {
        this.selectedMonth = month; // Update selected month
        this.setData(); // Call setData only if employee is defined
      }
    });
  }

  fetchMessage(): void
  {
    this.dataService.getEmployee('zigopvo').subscribe(
      (data: Employee | undefined) => {
        console.log(data);
      },
      (error: any) => {
        console.error('Error fetching message', error);
      }
    );
  }

  setData() : void
  {
    if (this.employee == undefined)
      throw new Error('Employee undefined');
    console.log('setData(): ' + JSON.stringify(this.employee) );
    // this.employee = {
    //   "employeeId": 1,
    // "personalNumber": "12345678",
    // "username": "zigopvo",
    // "levelRole": 5,
    // "managerId": null,
    // "costCenter": "1234-5678",
    // "firstName": "Pavol",
    // "lastName": "Žigo",
    // "email": "zigopvo@schaeffler.com",
    // "employed": true,
    // "approver": false
    // }
    this.realOvertime = this.dataService.getSumOvertime(this.employee.employeeId, this.selectedMonth);
    this.minOvertime = this.dataService.getMinLimit(this.employee.employeeId, this.selectedMonth);
    this.maxOvertime = this.dataService.getMaxLimit(this.employee.employeeId, this.selectedMonth);
    this.approved = false;
    //console.log('data: ', this.realOvertime, this.minOvertime, this.maxOvertime, this.approved);
  }

  isSidebarActive(): boolean 
  {
    //console.log('Sidebar: ', this.realOvertime);
    return TitleBarComponent.isSidebarActive;
  }

  isSidebarVisible(): boolean 
  {
    //console.log('Sidebar: ', this.realOvertime);
    return TitleBarComponent.isSidebarVisible;
  }

  getOvertimeStatus(): string 
  {
    //console.log('Overtime status: ', this.realOvertime);
    if (this.realOvertime < this.minOvertime) {
      return 'low-value';
    } else if (this.realOvertime + (this.maxOvertime * 0.1) > this.maxOvertime) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }

  toggleTableOrForm(): void 
  {
    // const table = document.getElementById('limits-table') as HTMLTableElement;

    // if (document.body.scrollWidth > window.innerWidth)
    // {
    //   table.style.display = 'none';
    // }
    // else
    // {
    //   table.style.display = 'table';
    // }
    const bodyWidth = document.body.scrollWidth;
    const windowWidth = window.innerWidth;

    this.isTableVisible = bodyWidth <= windowWidth;
    //console.log('Toggle table: ', this.realOvertime);
  }

  // calculateHoursToLimit(): void {
  //   this.hoursToLimit = this.overtimeMaxLimit - this.realOvertime;
  // }
}
