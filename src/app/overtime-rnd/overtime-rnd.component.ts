import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { Employee } from "../models/data.model"
import { UserFiltersComponent } from "../user-filters/user-filters.component";
import { MonthsTableComponent } from "../months-table/months-table.component";
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overtime-rnd',
  standalone: true,
  imports: [TitleBarComponent, CommonModule, FormsModule, UserFiltersComponent, MonthsTableComponent, TranslateModule],
  templateUrl: './overtime-rnd.component.html',
  styleUrl: './overtime-rnd.component.scss'
})
export class OvertimeRndComponent implements OnInit {
  title: string = 'RND';
  isFormOpen: boolean = true;
  loading: boolean = false;
  isTableVisible: boolean = true;
  approvedDisabled: boolean = false;
  selectedMonth: Date = new Date();

  teamRealOvertimes: Map<string, number> = new Map<string, number>();
  teamMinLimits: Map<string, number> = new Map<string, number>();
  teamMaxLimits: Map<string, number> = new Map<string, number>();

  minOvertimeSum: number = 0;
  maxOvertimeSum: number = 0;
  realOvertimeSum: number = 0;

  rndManager?: Employee;
  managers: Employee[] = [];

  constructor(private dataService: DataService, private router: Router) { }

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
              this.managers = await this.dataService.getSegmentManagers(this.rndManager.employeeId).toPromise() || [];
                  // console.log('team member 0: ', this.managers[0]);
              for (let i = 0; i < this.managers.length; i++)
              {
                this.teamRealOvertimes.set(this.managers[i].username, 0);
                this.teamMinLimits.set(this.managers[i].username, 0);
                this.teamMaxLimits.set(this.managers[i].username, 0);
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

  // filterTL: User | null = this.rndManager;

  // setFilter(user: User) {
  //   this.filterTL = user;
  // }

  // get filteredUsers() {
  //   return this.users.filter(user => user.manager === this.filterTL)
  // }

  // onButtonClick(user: User, form: string) {
  //   this.setFilter(user);
  //   this.showForm(form);
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

  async setData()
  {
    if (this.rndManager !== undefined)
      {
        this.teamMinLimits = await this.dataService.getMinLimitTeam(this.rndManager.employeeId, this.selectedMonth);
        this.teamMaxLimits = await this.dataService.getMaxLimitTeam(this.rndManager.employeeId, this.selectedMonth);
        this.teamRealOvertimes = await this.dataService.getSumOvertimeTeam(this.rndManager.employeeId, this.selectedMonth);
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
