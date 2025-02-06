import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { UserFiltersComponent } from "../user-filters/user-filters.component";
import { MonthsTableComponent } from "../months-table/months-table.component";
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Employee } from '../models/data.model';

@Component({
  selector: 'app-overtime-mng-teams',
  standalone: true,
  imports: [TitleBarComponent, UserFiltersComponent, MonthsTableComponent, TranslateModule, CommonModule, FormsModule],
  templateUrl: './overtime-mng-teams.component.html',
  styleUrl: './overtime-mng-teams.component.scss'
})
export class OvertimeMngTeamsComponent implements OnInit {

  title: string = 'SEGMENT';
  loading: boolean = false;
  teamRealOvertimes: Map<string, number> = new Map<string, number>();
  teamMinLimits: Map<string, number> = new Map<string, number>();
  teamMaxLimits: Map<string, number> = new Map<string, number>();
  minOvertimeSum: number = 0;
  maxOvertimeSum: number = 0;
  realOvertimeSum: number = 0;
  selectedMonth: Date = new Date();
  // teams: Employee[][] = [];
  employees: Employee[] = [];
  teamLeaders: Employee[] = [];
  manager?: Employee;
  selectedEmployee?: Employee;

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
        this.dataService.getEmployee(username).subscribe(
          (data: Employee | undefined) => {
            this.manager = data;
            if (this.manager === undefined) {
              this.loading = false;
              throw new Error('Employee undefined' + username);
            }
            //console.log(this.employee.username);
            // this.setData();
            this.loading = false;  // Set to false when data is fully loaded
            //console.log(this.employee.username);
          },
          (error: any) => {
              this.loading = false;
              console.error('Error fetching employee', error);
          }
        );
        if (this.manager != undefined)
        {
          this.dataService.getTeamMembers(this.manager.employee_id).subscribe(
            (data: Employee[]) =>
            {
              this.teamLeaders = data;
              console.log('team leader 0: ', this.teamLeaders[0]);
              this.setData();
            }
          );
          for (let i = 0; i < this.teamLeaders.length; i++)
          {
            this.teamRealOvertimes.set(this.teamLeaders[i].username, 0);
            this.teamMinLimits.set(this.teamLeaders[i].username, 0);   
            this.teamMaxLimits.set(this.teamLeaders[i].username, 0);  
          }
        }
        this.dataService.selectedMonth$.subscribe(
          (month: Date) => {
            this.loading = true;
            this.selectedMonth = month;
            this.setData();
            this.loading = false;
          }
        );
      }

  showSite(site: string) {
    this.router.navigate([site]);
  }

  selectEmployee(employee: Employee): void
  {
    this.selectedEmployee = employee;
    this.dataService.mngUsername = employee.username;
    this.router.navigate(['tl'], { queryParams: { source: this.router.url } });
  }

  getOvertimeStatusSum(): string 
  {
    //console.log('Overtime status: ', this.realOvertime);
    if (this.realOvertimeSum < this.minOvertimeSum) {
      return 'low-value';
    } else if (this.realOvertimeSum + (this.maxOvertimeSum * 0.1) > this.maxOvertimeSum) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }

  getOvertimeStatus(teamMember: Employee): string 
  {
    //console.log('Overtime status: ', this.realOvertime);
    
    if ((this.teamRealOvertimes.get(teamMember.username) || 0) < (this.teamMinLimits.get(teamMember.username) || 0)) {
      return 'low-value';
    } else if ((this.teamRealOvertimes.get(teamMember.username) || 0) + ((this.teamMaxLimits.get(teamMember.username) || 0) * 0.1) > (this.teamMaxLimits.get(teamMember.username) || 0)) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }

  setData(): void
  {
    if (this.manager !== undefined)
    {
      this.realOvertimeSum = 0;
      this.minOvertimeSum = 0;
      this.maxOvertimeSum = 0;
      this.teamLeaders.forEach(member => {
        this.teamMinLimits.set(member.username, this.dataService.getMinLimitTeamSum(member.employee_id, this.selectedMonth));
        this.teamMaxLimits.set(member.username, this.dataService.getMaxLimitTeamSum(member.employee_id, this.selectedMonth));
        this.teamRealOvertimes.set(member.username, this.dataService.getSumOvertimeTeamSum(member.employee_id, this.selectedMonth));
        let teamLeaderMinLimits = this.dataService.getMinLimitTeam(member.employee_id, this.selectedMonth);
        let teamLeaderMaxLimits = this.dataService.getMaxLimitTeam(member.employee_id, this.selectedMonth);
        let teamLeaderRealOvertimes = this.dataService.getSumOvertimeTeam(member.employee_id, this.selectedMonth);
        
        teamLeaderRealOvertimes.forEach((value: number, key: string) => {
          this.realOvertimeSum += value;
        });
        teamLeaderMinLimits.forEach((value: number, key: string) => {
          this.minOvertimeSum += value;
        });
        teamLeaderMaxLimits.forEach((value: number, key: string) => {
          this.maxOvertimeSum += value;
        });
      });
      console.log('real: ', this.realOvertimeSum);
    }
    
  }

}
