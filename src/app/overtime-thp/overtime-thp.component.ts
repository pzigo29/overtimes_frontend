import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
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

  constructor(private dataService: DataService) { }

  ngOnInit(): void 
  {
    let username = '';
    this.dataService.getThpUsername().subscribe(
      (data: string | null) => {
        if (data !== null)
          username = data;
      }
    );
    if (username !== '')
    {
      this.dataService.getEmployee(username).subscribe(
        (data: Employee | undefined) => {
          this.employee = data;
          if (this.employee === undefined) {
            this.loading = false;
            throw new Error('Employee undefined' + username);
          }
          //console.log(this.employee.username);
          this.setData();
          this.loading = false;  // Set to false when data is fully loaded
          //console.log(this.employee.username);
        },
        (error: any) => {
            this.loading = false;
            console.error('Error fetching employee', error);
        }
      );
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

  fetchMessage(): void
  {
    this.dataService.getMessage('zigopvo').subscribe(
      (data: string) => {
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
    this.realOvertime = this.dataService.getSumOvertime(this.employee.employee_id, this.selectedMonth);
    this.minOvertime = this.dataService.getMinLimit(this.employee.employee_id, this.selectedMonth);
    this.maxOvertime = this.dataService.getMaxLimit(this.employee.employee_id, this.selectedMonth);
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
