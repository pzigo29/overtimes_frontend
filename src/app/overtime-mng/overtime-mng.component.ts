import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { User } from "../models/data.model";
import { UserFiltersComponent } from "../user-filters/user-filters.component";
import { UserFilterService } from '../services/user-filter.service';
import { MonthsTableComponent } from "../months-table/months-table.component";
import { TranslateModule } from '@ngx-translate/core';
import { Employee } from '../models/data.model';
import { DataService } from '../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-overtime-mng',
  standalone: true,
  imports: [TitleBarComponent, CommonModule, FormsModule, UserFiltersComponent, MonthsTableComponent, TranslateModule],
  templateUrl: './overtime-mng.component.html',
  styleUrl: './overtime-mng.component.scss'
})
export class OvertimeMngComponent {

  segment: number = 3;
  title: string = 'SEGMENT';
  loading: boolean = false;
  approvedDisabled = true;

  team: Employee[] = [];
  teamRealOvertimes: Map<string, number> = new Map<string, number>();
  teamMinLimits: Map<string, number> = new Map<string, number>();
  teamMaxLimits: Map<string, number> = new Map<string, number>();

  isTableVisible: boolean = true;
  realOvertimeSum: number = 0;
  minOvertimeSum: number = 0;
  maxOvertimeSum: number = 0;
  selectedMonth: Date = new Date();
  selectedEmployee?: Employee;
  manager?: Employee;

  sourceSite: string | null = null;

  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void 
    {
      this.route.queryParams.subscribe(params => {
        this.sourceSite = params['source'];
        console.log('source: ', this.sourceSite);
      });
      let username = '';
      this.dataService.getMngUsername().subscribe(
        (data: string | null) => {
          if (data !== null)
            username = data;
        }
      );
      if (username !== '')
      {
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
        if (this.manager !== undefined) 
        {
          if (this.manager?.level_role < 4)
          {
            this.dataService.getTeamMembers(this.manager.employee_id).subscribe(
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

  // filterTL: User | null = null;

  // setFilter(user: User) {
  //   this.filterTL = user;
  // }

  // get filteredUsers() {
  //   return this.users.filter(user => user.manager === this.filterTL)
  // }

  // onTLButtonClick(user: User) {
  //   this.setFilter(user);
  //   this.showForm('THPForm');
  //   // this.title = 'Tím: ' + this.filterTL?.personUserName;
  //   }

  // sumOvertimeMaxLimits(users: User[]): number {
  //   let sum: number = 0;
  //   users.forEach(user => {
  //     sum += user.overtimeMaxLimit;
  //   });
  //   return sum;
  // }

  // sumOvertimeMinLimits(users: User[]): number {
  //   let sum: number = 0;
  //   users.forEach(user => {
  //     sum += user.overtimeMinLimit;
  //   });
  //   return sum;
  // }

  // getOvertimeStatus(user: User): string {
  //   if (user.realOvertime < user.overtimeMinLimit) {
  //     return 'low-value';
  //   } else if (user.realOvertime + (user.overtimeMaxLimit * 0.1) > user.overtimeMaxLimit) {
  //     return 'high-value';
  //   } else {
  //     return 'medium-value';
  //   }
  // }

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

  showSite(site: string): void
  {
    this.router.navigate([site]);
  }

  showTeamsSite(): void
  {
    this.manager?.level_role == 3 ? this.showSite('/tl/team') : (this.manager?.level_role == 2 ? this.showSite('/mng/teams') : this.showSite(''));
  }

  goBack(): void
  {
    this.location.back();
  }

  setData(): void
  {
    if (this.manager !== undefined)
    {
      this.teamMinLimits = this.dataService.getMinLimitTeam(this.manager.employee_id, this.selectedMonth);
      this.teamMaxLimits = this.dataService.getMaxLimitTeam(this.manager.employee_id, this.selectedMonth);
      this.teamRealOvertimes = this.dataService.getSumOvertimeTeam(this.manager.employee_id, this.selectedMonth);
      this.realOvertimeSum = 0;
      this.minOvertimeSum = 0;
      this.maxOvertimeSum = 0;
      this.teamRealOvertimes.forEach((value: number, key: string) => {
        this.realOvertimeSum += value;
      });
      this.teamMinLimits.forEach((value: number, key: string) => {
        this.minOvertimeSum += value;
      });
      this.teamMaxLimits.forEach((value: number, key: string) => {
        this.maxOvertimeSum += value;
      });
    }
  }

}
