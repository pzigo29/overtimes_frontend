import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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

  constructor(private dataService: DataService, private router: Router, private location: Location) { }

  async ngOnInit() 
  {
    const username: string = await this.dataService.getMngUsername().toPromise() || '';
    //   (data: string | null) => {
    //     if (data !== null)
    //       username = data;
    //   }
    // );
    if (username !== '')
    {
      this.manager = await this.dataService.getEmployee(username).toPromise();
      //   (data: Employee | undefined) => {
      //     this.manager = data;
      //     if (this.manager === undefined) {
      //       this.loading = false;
      //       throw new Error('Employee undefined' + username);
      //     }
      //     //console.log(this.employee.username);
      //     // this.setData();
      //     this.loading = false;  // Set to false when data is fully loaded
      //     //console.log(this.employee.username);
      //   },
      //   (error: any) => {
      //       this.loading = false;
      //       console.error('Error fetching employee', error);
      //   }
      // );
      if (this.manager != undefined)
      {
        if (this.manager.levelRole < 4)
        {
          this.teamLeaders = await this.dataService.getTeamLeaders(this.manager.employeeId).toPromise() || [];
          //   (data: Employee[]) =>
          //   {
          //     this.teamLeaders = data;
          //     console.log('team leader 0: ', this.teamLeaders[0]);
          //     this.setData();
          //   }
          // );
          for (let i = 0; i < this.teamLeaders.length; i++)
          {
            this.teamRealOvertimes.set(this.teamLeaders[i].username, 0);
            this.teamMinLimits.set(this.teamLeaders[i].username, 0);   
            this.teamMaxLimits.set(this.teamLeaders[i].username, 0);  
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

  setData(): void
  {
    if (this.manager !== undefined)
    {
      this.realOvertimeSum = 0;
      this.minOvertimeSum = 0;
      this.maxOvertimeSum = 0;
      this.teamLeaders.forEach(async member => {
        this.teamMinLimits.set(member.username, await this.dataService.getMinLimitTeamSum(member.employeeId, this.selectedMonth));
        this.teamMaxLimits.set(member.username, await this.dataService.getMaxLimitTeamSum(member.employeeId, this.selectedMonth));
        this.teamRealOvertimes.set(member.username, await this.dataService.getSumOvertimeTeamSum(member.employeeId, this.selectedMonth));
        let teamLeaderMinLimits = await this.dataService.getMinLimitTeam(member.employeeId, this.selectedMonth);
        let teamLeaderMaxLimits = await this.dataService.getMaxLimitTeam(member.employeeId, this.selectedMonth);
        let teamLeaderRealOvertimes = await this.dataService.getSumOvertimeTeam(member.employeeId, this.selectedMonth);
        
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
