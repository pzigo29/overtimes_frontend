import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../../shared-components/title-bar/title-bar.component";
import { MonthsTableComponent } from "../../shared-components/months-table/months-table.component";
import { TranslateModule } from '@ngx-translate/core';
import { EmployeeFiltersComponent } from "../../shared-components/employee-filters/employee-filters.component";
import { DataService } from '../../../services/data.service';
import { Router } from '@angular/router';
import { Employee, SortState } from '../../../models/data.model';

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
  teamApproved: Map<string, boolean> = new Map<string, boolean>();

  selectedMonth: Date = new Date();

  segmentSortState: SortState = SortState.NONE;
  teamSortState: SortState = SortState.NONE;
  realOvertimesSortState: SortState = SortState.DESC;
  minLimitSortState: SortState = SortState.NONE;
  maxLimitSortState: SortState = SortState.NONE;
  commentSortState: SortState = SortState.NONE;
  approvedSortState: SortState = SortState.NONE;

  constructor(private dataService: DataService, private router: Router, private location: Location) { }

  async ngOnInit() 
      {
        this.loading = true; // Start loading state
        while (!this.dataService.initialized) {
          console.log('Waiting for DataService to initialize... ');
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms
        }
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
                  
                  this.selectedMonth = month;
                  this.setData();
                  
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
          this.loading = false;
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
      this.loading = true;
      this.realOvertimeSum = 0;
      this.minOvertimeSum = 0;
      this.maxOvertimeSum = 0;
      const promises = this.filteredManagers.map(async manager => {
        // console.log(manager.username);
        const [teamMinLimits, teamMaxLimits, teamRealOvertimes, 
               teamLeaderMinLimits, teamLeaderMaxLimits, teamLeaderRealOvertimes, teamApproved] = await Promise.all([
          this.dataService.getMinLimitTeamSum(manager.employeeId, this.selectedMonth),
          this.dataService.getMaxLimitTeamSum(manager.employeeId, this.selectedMonth),
          this.dataService.getSumOvertimeTeamSum(manager.employeeId, this.selectedMonth),
          this.dataService.getMinLimitTeam(manager.employeeId, this.selectedMonth),
          this.dataService.getMaxLimitTeam(manager.employeeId, this.selectedMonth),
          this.dataService.getSumOvertimeTeam(manager.employeeId, this.selectedMonth),
          this.dataService.getApprovedStatusHierarchy(this.filteredManagers.map(manager => manager.employeeId), this.selectedMonth)
        ]);
        this.teamMinLimits.set(manager.username,teamMinLimits);
        this.teamMaxLimits.set(manager.username, teamMaxLimits);
        this.teamRealOvertimes.set(manager.username, teamRealOvertimes);
        // this.teamApproved.set(manager.username, teamApproved);
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
        teamApproved.forEach((value: boolean, key: string) => {
          this.teamApproved.set(key, value);
        });
      });

      Promise.all(promises).then(() => {});
      this.loading = false;
    }
    
  }

  setTeamApproved(manager: Employee, event: Event): void
  {
    const target = event.target as HTMLInputElement;
    this.teamApproved.set(manager.username, target.checked);
  }

  isPastMonth(month: Date): boolean
  {
    return this.dataService.isPastMonth(month);
  }

  saveChanges(): void
  {
    // DOROBIT
    for (let i = 0; i < this.filteredManagers.length; i++)
    {
      console.log('Manager: ', this.filteredManagers[i].username, ' Approved: ', this.teamApproved.get(this.filteredManagers[i].username));
      this.dataService.postApprovalsByManager(this.filteredManagers[i].employeeId, this.selectedMonth, (this.teamApproved.get(this.filteredManagers[i].username) || false) ? 'A' : 'W');
    }
  }

  onFilteredEmployees(filteredEmployees: Employee[]): void {
    this.filteredManagers = filteredEmployees;
    // this.recalculateSums();
  }

  toggleSortBySegment(): void 
  {
    this.filteredManagers.sort((a, b) => {
      if (this.segmentSortState === SortState.ASC) {
        return a.department.localeCompare(b.department);
      } else {
        return b.department.localeCompare(a.department);
      }
    });
    this.segmentSortState = this.segmentSortState === SortState.ASC ? SortState.DESC : SortState.ASC;
  }

  toggleSortByMinLimit(): void
  {
    this.filteredManagers.sort((a, b) => {
      if (this.minLimitSortState === SortState.ASC) {
        return (this.teamMinLimits.get(a.username) ?? 0) - (this.teamMinLimits.get(b.username) ?? 0);
      } else {
        return (this.teamMinLimits.get(b.username) ?? 0) - (this.teamMinLimits.get(a.username) ?? 0);
      }
    });
    this.minLimitSortState = this.minLimitSortState === SortState.ASC ? SortState.DESC : SortState.ASC;
  }

  toggleSortByMaxLimit(): void
  {
    this.filteredManagers.sort((a, b) => {
      if (this.maxLimitSortState === SortState.ASC) {
        return (this.teamMaxLimits.get(a.username) ?? 0) - (this.teamMaxLimits.get(b.username) ?? 0);
      } else {
        return (this.teamMaxLimits.get(b.username) ?? 0) - (this.teamMaxLimits.get(a.username) ?? 0);
      }
    });
    this.maxLimitSortState = this.maxLimitSortState === SortState.ASC ? SortState.DESC : SortState.ASC;
  }

  toggleSortByRealOvertimes(): void
  {
    this.filteredManagers.sort((a, b) => {
      if (this.realOvertimesSortState === SortState.ASC) {
        return (this.teamRealOvertimes.get(a.username) ?? 0) - (this.teamRealOvertimes.get(b.username) ?? 0);
      } else {
        return (this.teamRealOvertimes.get(b.username) ?? 0) - (this.teamRealOvertimes.get(a.username) ?? 0);
      }
    });
    this.realOvertimesSortState = this.realOvertimesSortState === SortState.ASC ? SortState.DESC : SortState.ASC;
  }

  // toggleSortByApproved(): void
  // {
  //   this.filteredManagers.sort((a, b) => {
  //     if (this.approvedSortState === SortState.ASC) {
  //       return a.approved.localeCompare(b.approved);
  //     } else {
  //       return b.approved.localeCompare(a.approved);
  //     }
  //   });
  //   this.approvedSortState = this.approvedSortState === SortState.ASC ? SortState.DESC : SortState.ASC;
  // }

  // toggleSortByComment(): void
  // {
  //   this.filteredManagers.sort((a, b) => {
  //     if (this.commentSortState === SortState.ASC) {
  //       return a.comment.localeCompare(b.comment);
  //     } else {
  //       return b.comment.localeCompare(a.comment);
  //     }
  //   });
  //   this.commentSortState = this.commentSortState === SortState.ASC ? SortState.DESC : SortState.ASC;
  // }
}
