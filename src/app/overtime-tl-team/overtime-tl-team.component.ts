import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TitleBarComponent } from '../title-bar/title-bar.component';
import { Employee } from '../models/data.model';
import { EmployeeFiltersComponent } from "../employee-filters/employee-filters.component";
import { MonthsTableComponent } from "../months-table/months-table.component";
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-overtime-tl-team',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TitleBarComponent, EmployeeFiltersComponent, MonthsTableComponent, TranslateModule],
  templateUrl: './overtime-tl-team.component.html',
  styleUrl: './overtime-tl-team.component.scss'
})
export class OvertimeTLTeamComponent implements OnInit, OnDestroy {
title: string = 'TL';
  leader?: Employee;
  wholeTeam: Employee[] = [];
  filteredTeam: Employee[] = [];
  teamRealOvertimes: Map<string, number> = new Map<string, number>();
  teamMinLimits: Map<string, number> = new Map<string, number>();
  teamMaxLimits: Map<string, number> = new Map<string, number>();
  teamApproved: Map<string, boolean> = new Map<string, boolean>();
  teamReason: Map<string, string> = new Map<string, string>();
  realOvertimeSum: number = 0;
  minOvertimeSum: number = 0;
  maxOvertimeSum: number = 0;
  selectedMonth: Date = new Date();
  loading: boolean = true;
  private selectedMonthSubscription?: Subscription;
  private overtimeSubscription?: Subscription;
  private isSettingData: boolean = false;
  overtimeForm: FormGroup;
  // approved: boolean = true;

  constructor(private dataService: DataService, private fb: FormBuilder, private router: Router, private location: Location, private cd: ChangeDetectorRef) {
    this.overtimeForm = this.fb.group({
      minOvertimeSum: new FormControl({ value: 0, disabled: true }),
      maxOvertimeSum: new FormControl({ value: 0, disabled: true }),
      approved: new FormControl({ value: false, disabled: false }),
      reason: new FormControl({ value: '', disabled: true })
    });
  }

  async ngOnInit() {
    try {
      let username: string | null = await firstValueFrom(this.dataService.getTlUsername());
      if (username) {
        this.leader = await firstValueFrom(this.dataService.getEmployee(username));
        if (this.leader) 
        {
          this.filteredTeam = await firstValueFrom(this.dataService.getTeamMembers(this.leader.employeeId));
          this.wholeTeam = this.filteredTeam; // Save the whole team in case we want to reset the filters
        }
        
        // Initialize form controls for each team member
        this.filteredTeam.forEach(member => {
          this.overtimeForm.addControl(member.username + '_min', new FormControl(0));
          this.overtimeForm.addControl(member.username + '_max', new FormControl(0));
          this.overtimeForm.addControl(member.username + '_approved', new FormControl({ value: false, disabled: !(this.leader?.levelRole === 1) }));
          this.overtimeForm.addControl(member.username + '_reason', new FormControl(''));
          this.teamRealOvertimes.set(member.username, 0);
          this.teamMinLimits.set(member.username, 0);
          this.teamMaxLimits.set(member.username, 0);
        });

        await this.setData(); // Call the function to set whatever data is necessary
      } else {
        console.error('No username found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.loading = false; // End loading state
    }

    // Subscribe to selected month
    this.selectedMonthSubscription = this.dataService.selectedMonth$.subscribe(month => {
      if (this.leader) {
        this.selectedMonth = month;
        this.setData(); // Set data only if leader is defined
      }
    });

    // Subscribe to form changes
    this.overtimeForm.valueChanges.subscribe(values => {
      this.filteredTeam.forEach(member => {
        const minLimit = values[member.username + '_min'] || 0;
        const maxLimit = values[member.username + '_max'] || 0;
        const approved = values[member.username + '_approved'] || true;
        const reason = values[member.username + '_reason'] || '';
        this.teamMinLimits.set(member.username, minLimit);
        this.teamMaxLimits.set(member.username, maxLimit);
        this.teamApproved.set(member.username, approved);
        this.teamReason.set(member.username, reason);
      });
      this.recalculateSums();
    });
  }

  ngOnDestroy() {
    if (this.selectedMonthSubscription) {
      this.selectedMonthSubscription.unsubscribe();
    }
    if (this.overtimeSubscription) {
      this.overtimeSubscription.unsubscribe();
    }
  }

  async setData(): Promise<void> {
//         if (this.isSettingData) {
//               console.log('Already setting data');
//   //             return; // Prevent concurrent calls to setData
//         }
    this.isSettingData = true;

    if (this.leader == undefined) {
      this.isSettingData = false;
      throw new Error('Leader undefined');
    }
    this.realOvertimeSum = 0;
    this.minOvertimeSum = 0;
    this.maxOvertimeSum = 0;
    console.log('Team in setData:' + JSON.stringify(this.filteredTeam));

    const promises = this.filteredTeam.map(async member => {
      const overtimes = await this.dataService.getSumOvertime(member.employeeId, this.selectedMonth);
      // const minLimit = await this.dataService.getMinLimit(member.employeeId, this.selectedMonth);
      // const maxLimit = await this.dataService.getMaxLimit(member.employeeId, this.selectedMonth);
      // const approved = await this.dataService.getApprovedStatus(member.employeeId, this.selectedMonth);
      const limit = await this.dataService.getOvertimeLimit(member.employeeId, this.selectedMonth);
      const minLimit = limit?.minHours || 0;
      const maxLimit = limit?.maxHours || 0;
      const approved = limit?.statusId === 'A' ? true : false;

      this.teamRealOvertimes.set(member.username, overtimes);
      this.teamMinLimits.set(member.username, minLimit);
      this.teamMaxLimits.set(member.username, maxLimit);
      this.teamApproved.set(member.username, approved);

      // Update form control values
      this.overtimeForm.get(member.username + '_min')?.setValue(minLimit, { emitEvent: false });
      this.overtimeForm.get(member.username + '_max')?.setValue(maxLimit, { emitEvent: false });
      this.overtimeForm.get(member.username + '_approved')?.setValue(approved, { emitEvent: false });

      return { overtimes, minLimit, maxLimit };
    });

    const results = await Promise.all(promises);

    results.forEach(result => {
      this.realOvertimeSum += result.overtimes;
      this.minOvertimeSum += result.minLimit;
      this.maxOvertimeSum += result.maxLimit;
    });

    // Enable form controls, set values, and disable them again
    this.overtimeForm.get('minOvertimeSum')?.enable({ emitEvent: false });
    this.overtimeForm.get('maxOvertimeSum')?.enable({ emitEvent: false });
    this.overtimeForm.get('minOvertimeSum')?.setValue(this.minOvertimeSum, { emitEvent: false });
    this.overtimeForm.get('maxOvertimeSum')?.setValue(this.maxOvertimeSum, { emitEvent: false });
    this.overtimeForm.get('minOvertimeSum')?.disable({ emitEvent: false });
    this.overtimeForm.get('maxOvertimeSum')?.disable({ emitEvent: false });

    console.log('maxOvertimeSum: ' + this.maxOvertimeSum);
    console.log('real: ', this.realOvertimeSum);

    this.isSettingData = false;
    
    this.cd.detectChanges();
  }

  async saveLimits(): Promise<void> {
    const savePromises = this.filteredTeam.map(member => {
      this.dataService.setLimit(member.employeeId, this.selectedMonth, this.teamMinLimits.get(member.username) || 0, this.teamMaxLimits.get(member.username) || 0);
      this.dataService.setApprovedStatus(member.employeeId, this.leader?.employeeId || 0, this.selectedMonth, (this.teamApproved.get(member.username) || false) ? 'A' : 'W', '');
    });

    await Promise.all(savePromises);
    await this.setData();
  }

  recalculateSums(): void {
    this.realOvertimeSum = 0;
    this.minOvertimeSum = 0;
    this.maxOvertimeSum = 0;

    this.filteredTeam.forEach(member => {
      const overtimes = this.teamRealOvertimes.get(member.username) || 0;
      const minLimit = this.teamMinLimits.get(member.username) || 0;
      const maxLimit = this.teamMaxLimits.get(member.username) || 0;

      this.realOvertimeSum += overtimes;
      this.minOvertimeSum += minLimit;
      this.maxOvertimeSum += maxLimit;
    });

    // Enable form controls, set values, and disable them again
    this.overtimeForm.get('minOvertimeSum')?.enable({ emitEvent: false });
    this.overtimeForm.get('maxOvertimeSum')?.enable({ emitEvent: false });
    this.overtimeForm.get('minOvertimeSum')?.setValue(this.minOvertimeSum, { emitEvent: false });
    this.overtimeForm.get('maxOvertimeSum')?.setValue(this.maxOvertimeSum, { emitEvent: false });
    this.overtimeForm.get('minOvertimeSum')?.disable({ emitEvent: false });
    this.overtimeForm.get('maxOvertimeSum')?.disable({ emitEvent: false });

    console.log('Recalculated maxOvertimeSum: ' + this.maxOvertimeSum);
    console.log('Recalculated real: ', this.realOvertimeSum);
    this.cd.detectChanges();
  }

  showSite(site: string): void {
    this.router.navigate([site]);
  }

  goBack(): void {
    this.location.back();
  }

  async selectEmployee(employee: Employee): Promise<void> 
  {
    try
    {
      await this.dataService.setSelectedEmployee(employee.username);
      this.router.navigate(['tl/team/detail'], { queryParams: { source: this.router.url } });
    } catch (error) {
      console.error('Error fetching employee', error);
    }
  }

  getOvertimeStatusSum(): string {
    if (this.realOvertimeSum < this.minOvertimeSum) {
      return 'low-value';
    } else if (this.realOvertimeSum + (this.maxOvertimeSum * 0.1) > this.maxOvertimeSum) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }

  getOvertimeStatus(teamMember: Employee): string {
    if ((this.teamRealOvertimes.get(teamMember.username) || 0) < (this.teamMinLimits.get(teamMember.username) || 0)) {
      return 'low-value';
    } else if ((this.teamRealOvertimes.get(teamMember.username) || 0) + ((this.teamMaxLimits.get(teamMember.username) || 0) * 0.1) > (this.teamMaxLimits.get(teamMember.username) || 0)) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }

  getOvertimeReason(member: Employee, selectedMonth: Date): string {
    return this.teamReason.get(member.username) || '';
  }

  setApproved(member: Employee, event: Event): void {
    const approved: boolean = (event.target as HTMLInputElement).checked;
    this.teamApproved.set(member.username, approved);
    // this.recalculateSums();
  }

  onFilteredEmployees(filteredEmployees: Employee[]): void {
    this.filteredTeam = filteredEmployees;
    this.recalculateSums();
  }
}
