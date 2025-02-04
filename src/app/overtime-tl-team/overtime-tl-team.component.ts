import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from '../title-bar/title-bar.component';
import { Employee } from '../models/data.model';
import { UserFiltersComponent } from "../user-filters/user-filters.component";
import { MonthsTableComponent } from "../months-table/months-table.component";
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overtime-tl-team',
  standalone: true,
  imports: [FormsModule, CommonModule, TitleBarComponent, UserFiltersComponent, MonthsTableComponent],
  templateUrl: './overtime-tl-team.component.html',
  styleUrl: './overtime-tl-team.component.scss'
})
export class OvertimeTLTeamComponent {

  title: string = 'Môj tím';
  // selectedEmployee?: Employee;
  leader?: Employee;
  team: Employee[] = [];
  teamRealOvertimes: Map<string, number> = new Map<string, number>();
  teamMinLimits: Map<string, number> = new Map<string, number>();
  teamMaxLimits: Map<string, number> = new Map<string, number>();
  realOvertimeSum: number = 0;
  minOvertimeSum: number = 0;
  maxOvertimeSum: number = 0;
  loading: boolean = false;
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
        this.dataService.getEmployee(username).subscribe(
          (data: Employee | undefined) => {
            this.leader = data;
            if (this.leader === undefined) {
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
        if (this.leader != undefined)
        {
          this.dataService.getTeamMembers(this.leader.employee_id).subscribe(
            (data: Employee[]) =>
            {
              this.team = data;
              console.log('team member 0: ', this.team[0]);
              this.setData();
            }
          );
          for (let i = 0; i < this.team.length; i++)
          {
            this.teamRealOvertimes.set(this.team[i].username, 0);
            this.teamMinLimits.set(this.team[i].username, 0);   
            this.teamMaxLimits.set(this.team[i].username, 0);  
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

  showSite(site: string): void
  {
    // for (let i = 0; i < this.shownSite.length; i++)
    // {
    //   this.shownSite[i] = false;
    // }
    // this.shownSite[site] = true;
    this.router.navigate([`${site}`]);
  }

  selectEmployee(employee: Employee): void
  {
    // this.selectedEmployee = employee;
    this.router.navigate([`tl/team/detail/${employee.username}`]);
    this.dataService.setSelectedEmployee(employee.username);
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
    if (this.leader == undefined)
      throw new Error('Leader undefined');
    this.realOvertimeSum = 0;
    this.minOvertimeSum = 0;
    this.maxOvertimeSum = 0;
    this.team.forEach(member => {
      let overtimes = this.dataService.getSumOvertime(member.employee_id, this.selectedMonth);
      let minLimit = this.dataService.getMinLimit(member.employee_id, this.selectedMonth);
      let maxLimit = this.dataService.getMaxLimit(member.employee_id, this.selectedMonth);
      this.realOvertimeSum += overtimes;
      this.minOvertimeSum += minLimit;
      this.maxOvertimeSum += maxLimit;
      this.teamRealOvertimes.set(member.username, overtimes);
      this.teamMinLimits.set(member.username, minLimit);
      this.teamMaxLimits.set(member.username, maxLimit);
    });
    console.log('real: ', this.realOvertimeSum);
  }
}
