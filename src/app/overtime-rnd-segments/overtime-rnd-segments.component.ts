import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { MonthsTableComponent } from "../months-table/months-table.component";
import { TranslateModule } from '@ngx-translate/core';
import { EmployeeFiltersComponent } from "../employee-filters/employee-filters.component";
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { Employee } from '../models/data.model';

@Component({
  selector: 'app-overtime-rnd-segments',
  standalone: true,
  imports: [TitleBarComponent, MonthsTableComponent, TranslateModule, CommonModule, FormsModule, EmployeeFiltersComponent],
  templateUrl: './overtime-rnd-segments.component.html',
  styleUrl: './overtime-rnd-segments.component.scss'
})
export class OvertimeRndSegmentsComponent implements OnInit {

  title: string = 'RND';
  loading: boolean = true;
  isTableVisible: boolean = true;
  approvedDisabled: boolean = false;
  minOvertimeSum: number = 0;
  maxOvertimeSum: number = 0;
  realOvertimeSum: number = 0;
  rndManager?: Employee;
  allManagers: Employee[] = [];
  filteredManagers: Employee[] = []; 

  teamRealOvertimes: Map<string, number> = new Map<string, number>();
  teamMinLimits: Map<string, number> = new Map<string, number>();
  teamMaxLimits: Map<string, number> = new Map<string, number>();

  selectedMonth: Date = new Date();

  constructor(private dataService: DataService, private router: Router, private location: Location) { }

  async ngOnInit() 
      {
        const username: string = await this.dataService.getRndUsername().toPromise() || '';
        if (username !== '')
        {
          this.rndManager = await this.dataService.getEmployee(username).toPromise();
          if (this.rndManager !== undefined) 
          {
            if (this.rndManager?.levelRole == 1)
            {
              this.filteredManagers = await this.dataService.getSegmentManagers(this.rndManager.employeeId).toPromise() || [];
              this.allManagers = this.filteredManagers;
                  // console.log('team member 0: ', this.managers[0]);
              for (let i = 0; i < this.filteredManagers.length; i++)
              {
                this.teamRealOvertimes.set(this.filteredManagers[i].username, 0);
                this.teamMinLimits.set(this.filteredManagers[i].username, 0);
                this.teamMaxLimits.set(this.filteredManagers[i].username, 0);
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
            else
            {
              console.log('manager doesnt have access');
            }
          }
          else
          {
            console.log('manager undef');
          }
        }
        else
        {
          this.loading = true;
        }
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

  goBack(): void
  {
    this.location.back();
  }

  showSite(site: string): void
  {
    this.router.navigate([site]);
  }

  showTeamsSite(manager: Employee): void
  {
    if (manager.levelRole == 3) 
    {
      this.dataService.tlUsername = manager.username;
      this.showSite('/tl/team');
    }
    else if (manager.levelRole == 2)
    {
      this.dataService.mngUsername = manager.username;
      this.showSite('/mng/teams');
    }
    else
    {
      this.showSite('');
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

  selectManager(employee: Employee): void
  {
    // this.selectedEmployee = employee;
    this.router.navigate(['mng/teams'], { queryParams: { source: this.router.url } });
    this.dataService.mngUsername = employee.username;
  }

  setData(): void
  {
    if (this.rndManager !== undefined)
    {
      this.realOvertimeSum = 0;
      this.minOvertimeSum = 0;
      this.maxOvertimeSum = 0;
      const promises = this.filteredManagers.map(async manager => {
        // console.log(manager.username);
        const [teamMinLimits, teamMaxLimits, teamRealOvertimes, 
               teamLeaderMinLimits, teamLeaderMaxLimits, teamLeaderRealOvertimes] = await Promise.all([
          this.dataService.getMinLimitTeamSum(manager.employeeId, this.selectedMonth),
          this.dataService.getMaxLimitTeamSum(manager.employeeId, this.selectedMonth),
          this.dataService.getSumOvertimeTeamSum(manager.employeeId, this.selectedMonth),
          this.dataService.getMinLimitTeam(manager.employeeId, this.selectedMonth),
          this.dataService.getMaxLimitTeam(manager.employeeId, this.selectedMonth),
          this.dataService.getSumOvertimeTeam(manager.employeeId, this.selectedMonth)
        ]);
        this.teamMinLimits.set(manager.username,teamMinLimits);
        this.teamMaxLimits.set(manager.username, teamMaxLimits);
        this.teamRealOvertimes.set(manager.username, teamRealOvertimes);
        // let teamLeaderMinLimits = await this.dataService.getMinLimitTeam(manager.employeeId, this.selectedMonth);
        // let teamLeaderMaxLimits = await this.dataService.getMaxLimitTeam(manager.employeeId, this.selectedMonth);
        // let teamLeaderRealOvertimes = await this.dataService.getSumOvertimeTeam(manager.employeeId, this.selectedMonth);
        
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

      Promise.all(promises).then(() => {});
    }
    
  }

  saveChanges(): void
  {

  }

  onFilteredEmployees(filteredEmployees: Employee[]): void {
    this.filteredManagers = filteredEmployees;
    // this.recalculateSums();
  }
}
