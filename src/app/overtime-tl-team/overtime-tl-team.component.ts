import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from '../title-bar/title-bar.component';
import { Employee } from '../models/data.model';
import { UserFiltersComponent } from "../user-filters/user-filters.component";
import { MonthsTableComponent } from "../months-table/months-table.component";
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-overtime-tl-team',
  standalone: true,
  imports: [FormsModule, CommonModule, TitleBarComponent, UserFiltersComponent, MonthsTableComponent, TranslateModule],
  templateUrl: './overtime-tl-team.component.html',
  styleUrl: './overtime-tl-team.component.scss'
})
export class OvertimeTLTeamComponent {

  title: string = 'TL';
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

  constructor(private dataService: DataService, private router: Router, private location: Location) { }

  async ngOnInit() {
    this.loading = true; // Start loading state
    try {
  
      // Get the username from the service
      const username: string = await this.dataService.getTlUsername().toPromise() || '';
      if (username) {
        console.log('Fetched username:', username);
  
        // Get the employee data
        this.leader = await this.dataService.getEmployee(username).toPromise();
        console.log('getEmployee: ', JSON.stringify(this.leader));
  
        if (!this.leader) {
          throw new Error('Employee undefined for username: ' + username);
        }
  
        // Fetch team members
        this.team = await this.dataService.getTeamMembers(this.leader.employeeId).toPromise() || [];
        console.log('Team members: ', this.team);
  
        // Initialize limits for each team member
        this.team.forEach(member => {
          this.teamRealOvertimes.set(member.username, 0);
          this.teamMinLimits.set(member.username, 0);
          this.teamMaxLimits.set(member.username, 0);  
        });
  
        this.setData(); // Call the function to set whatever data is necessary
      } else {
        console.error('No username found');
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.loading = false; // End loading state
    }
  
    // Subscribe to selected month
    this.dataService.selectedMonth$.subscribe(month => {
      if (this.leader) {
        this.selectedMonth = month;
        this.setData(); // Set data only if leader is defined
      }
    });
  }

  showSite(site: string): void
  {
    this.router.navigate([`${site}`]);
  }

  goBack(): void
  {
    this.location.back();
  }

  selectEmployee(employee: Employee): void
  {
    // this.selectedEmployee = employee;
    this.router.navigate(['tl/team/detail']);
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
      let overtimes = this.dataService.getSumOvertime(member.employeeId, this.selectedMonth);
      let minLimit = this.dataService.getMinLimit(member.employeeId, this.selectedMonth);
      let maxLimit = this.dataService.getMaxLimit(member.employeeId, this.selectedMonth);
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
