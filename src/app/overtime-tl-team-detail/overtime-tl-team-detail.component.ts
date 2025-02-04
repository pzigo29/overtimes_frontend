import { Component } from '@angular/core';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { Employee } from '../models/data.model';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MonthsTableComponent } from "../months-table/months-table.component";

@Component({
  selector: 'app-overtime-tl-team-detail',
  standalone: true,
  imports: [TitleBarComponent, FormsModule, CommonModule, MonthsTableComponent],
  templateUrl: './overtime-tl-team-detail.component.html',
  styleUrl: './overtime-tl-team-detail.component.scss'
})
export class OvertimeTLTeamDetailComponent {
  title: string = 'Detail zamestnanca';
  selectedEmployee?: Employee;
  minLimit: number = 0;
  maxLimit: number = 0;
  realOvertime: number = 0;
  selectedMonth: Date = new Date();

  constructor(private dataService: DataService, private router: Router) 
  {
    
  }

  ngOnInit(): void
  {
    let username = '';
    this.dataService.getUsername().subscribe(
      (data: string) => {
        username = data;
      }
    );
    this.dataService.selectedMonth$.subscribe(
      (data: Date) => {
        this.selectedMonth = data;
        this.setData();
      }
    );
    this.dataService.getSelectedEmployee().subscribe(
      (data: Employee | undefined) => {
        this.selectedEmployee = data;
        this.setData();
        
      },
      (error: any) => {
        console.error('Error fetching employee', error);
      }
    );
  }

  setData(): void
  {
    if (this.selectedEmployee === undefined) {
      throw new Error('Employee undefined');
    }
    this.minLimit = this.dataService.getMinLimit(this.selectedEmployee.employee_id, this.selectedMonth);
    this.maxLimit = this.dataService.getMaxLimit(this.selectedEmployee.employee_id, this.selectedMonth);
    this.realOvertime = this.dataService.getSumOvertime(this.selectedEmployee.employee_id, this.selectedMonth);
  }

  getOvertimeStatus(employee: Employee): string 
  {
    //console.log('Overtime status: ', this.realOvertime);
    
    if ((this.realOvertime) < (this.minLimit)) {
      return 'low-value';
    } else if ((this.realOvertime + (this.maxLimit * 0.1) > (this.maxLimit))) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }

  showSite(site: string): void
  {
    // for (let i = 0; i < this.shownSite.length; i++)
    // {
    //   this.shownSite[i] = false;
    // }
    // this.shownSite[site] = true;
    this.router.navigate([`${site}`]);
  }
}
