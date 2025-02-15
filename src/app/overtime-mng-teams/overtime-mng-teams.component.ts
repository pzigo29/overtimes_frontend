import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { EmployeeFiltersComponent } from "../employee-filters/employee-filters.component";
import { MonthsTableComponent } from "../months-table/months-table.component";
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Employee } from '../models/data.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-overtime-mng-teams',
  standalone: true,
  imports: [TitleBarComponent, EmployeeFiltersComponent, MonthsTableComponent, TranslateModule, CommonModule, FormsModule],
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
  allTeamLeaders: Employee[] = [];
  filteredTeamLeaders: Employee[] = [];
  manager?: Employee;
  selectedEmployee?: Employee;

  constructor(private dataService: DataService, private router: Router, private location: Location) { }

  async ngOnInit() 
  {
    const username: string = await firstValueFrom(this.dataService.getMngUsername()) || '';
    if (username !== '')
    {
      this.manager = await firstValueFrom(this.dataService.getEmployee(username));
      if (this.manager != undefined)
      {
        if (this.manager.levelRole < 4)
        {
          this.filteredTeamLeaders = await firstValueFrom(this.dataService.getTeamLeaders(this.manager.employeeId)) || [];
          this.allTeamLeaders = this.filteredTeamLeaders;
          for (let i = 0; i < this.filteredTeamLeaders.length; i++)
          {
            this.teamRealOvertimes.set(this.filteredTeamLeaders[i].username, 0);
            this.teamMinLimits.set(this.filteredTeamLeaders[i].username, 0);   
            this.teamMaxLimits.set(this.filteredTeamLeaders[i].username, 0);  
          }
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
    else
    {
      this.loading = true;
    }
  }

  showSite(site: string) 
  {
    this.router.navigate([site]);
  }

  goBack(): void
  {
    this.location.back();
  }

  selectEmployee(employee: Employee): void
  {
    this.selectedEmployee = employee;
    this.dataService.tlUsername = employee.username;
    this.router.navigate(['tl/team'], { queryParams: { source: this.router.url } });
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

  async setData(): Promise<void> {
    if (this.manager === undefined) {
      throw new Error('Leader undefined');
    }
  
    this.realOvertimeSum = 0;
    this.minOvertimeSum = 0;
    this.maxOvertimeSum = 0;
    console.log('Team leaders in setData:', JSON.stringify(this.filteredTeamLeaders));
  
    try {
      const results = await Promise.all(this.filteredTeamLeaders.map(async member => {
        const overtimes = await this.dataService.getSumOvertimeTeam(member.employeeId, this.selectedMonth);
        const minLimit = await this.dataService.getMinLimitTeam(member.employeeId, this.selectedMonth);
        const maxLimit = await this.dataService.getMaxLimitTeam(member.employeeId, this.selectedMonth);
  
        console.log(`Fetched data for ${member.username}:`, { overtimes, minLimit, maxLimit });
  
        let overtimesSum = 0;
        let minLimitSum = 0;
        let maxLimitSum = 0;
  
        overtimes.forEach((value: number) => {
          overtimesSum += value;
        });
        minLimit.forEach((value: number) => {
          minLimitSum += value;
        });
        maxLimit.forEach((value: number) => {
          maxLimitSum += value;
        });
  
        console.log(`Summed data for ${member.username}:`, { overtimesSum, minLimitSum, maxLimitSum });
  
        this.teamRealOvertimes.set(member.username, overtimesSum);
        this.teamMinLimits.set(member.username, minLimitSum);
        this.teamMaxLimits.set(member.username, maxLimitSum);
  
        return { overtimesSum, minLimitSum, maxLimitSum };
      }));
  
      results.forEach(result => {
        this.realOvertimeSum += result.overtimesSum;
        this.minOvertimeSum += result.minLimitSum;
        this.maxOvertimeSum += result.maxLimitSum;
      });
  
      console.log('Final sums:', {
        realOvertimeSum: this.realOvertimeSum,
        minOvertimeSum: this.minOvertimeSum,
        maxOvertimeSum: this.maxOvertimeSum
      });
    } catch (error) {
      console.error('Error in setData:', error);
    }
  }

  onFilteredEmployees(filteredEmployees: Employee[]): void {
    this.filteredTeamLeaders = filteredEmployees;
    // this.recalculateSums();
  }

}
