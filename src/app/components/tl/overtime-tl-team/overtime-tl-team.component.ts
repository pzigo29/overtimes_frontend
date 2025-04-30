import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TitleBarComponent } from '../../shared-components/title-bar/title-bar.component';
import { Employee, SortState } from '../../../models/data.model';
import { EmployeeFiltersComponent } from "../../shared-components/employee-filters/employee-filters.component";
import { MonthsTableComponent } from "../../shared-components/months-table/months-table.component";
import { DataService } from '../../../services/data.service';
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
  teamRequestCounts: Map<string, number> = new Map<string, number>();
  realOvertimeSum: number = 0;
  minOvertimeSum: number = 0;
  maxOvertimeSum: number = 0;
  selectedMonth: Date = new Date();
  loading: boolean = true;
  private selectedMonthSubscription?: Subscription;
  private overtimeSubscription?: Subscription;
  private isSettingData: boolean = false;
  overtimeForm: FormGroup;
  leaderSumOvertimes: number = 0;
  leaderMinLimit: number = 0;
  leaderMaxLimit: number = 0;
  leaderReason: string = '';
  leaderApproved: boolean = false;
  leaderRequestCount: number = 0;
  // approved: boolean = true;
  lastNameSortState: SortState = SortState.NONE;
  minLimitSortState: SortState = SortState.NONE;
  maxLimitSortState: SortState = SortState.NONE;
  realOvertimesSortState: SortState = SortState.DESC;
  approvedSortState: SortState = SortState.NONE;

  editable: boolean = false;

  isPastDeadlineValue: boolean = true;

  constructor(public dataService: DataService, private fb: FormBuilder, private router: Router, private location: Location, private cd: ChangeDetectorRef) {
    this.overtimeForm = this.fb.group({
      minOvertimeSum: new FormControl({ value: 0, disabled: true }),
      maxOvertimeSum: new FormControl({ value: 0, disabled: true }),
      approved: new FormControl({ value: false, disabled: false }),
      reason: new FormControl({ value: '', disabled: true })
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.loading = true; // Start loading state
      while (!this.dataService.initialized) {
        console.log('Waiting for DataService to initialize... ');
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms
      }
      console.log('DataService initialized: ', this.dataService.initialized);
      //this.dataService.initialized = false; // Reset initialized flag
      let username: string | null = await firstValueFrom(this.dataService.getTlUsername());
      if (username) {
        this.leader = await firstValueFrom(this.dataService.getEmployee(username));
        this.isPastDeadlineValue = await this.dataService.isPastDeadline();
        if (this.leader) 
        {
          this.filteredTeam = await firstValueFrom(this.dataService.getTeamMembers(this.leader.employeeId));
          this.wholeTeam = this.filteredTeam; // Save the whole team in case we want to reset the filters
        }
        
        // Initialize form controls for each team member
        this.filteredTeam.forEach(member => {
          this.overtimeForm.addControl(member.username + '_min', new FormControl({value: 0, disabled: this.isPastMonth(this.selectedMonth) || !this.editable}));
          this.overtimeForm.addControl(member.username + '_max', new FormControl({value: 0, disabled: this.isPastMonth(this.selectedMonth) || !this.editable}));
          this.overtimeForm.addControl(member.username + '_approved', new FormControl({ value: false, disabled: !(this.dataService.userEmployee?.levelRole === 1) || this.isPastMonth(this.selectedMonth) || !this.editable}));
          this.overtimeForm.addControl(member.username + '_reason', new FormControl({ value: '', disabled: this.isPastMonth(this.selectedMonth) || !this.editable}));
          this.teamRealOvertimes.set(member.username, 0);
          this.teamMinLimits.set(member.username, 0);
          this.teamMaxLimits.set(member.username, 0);
          this.teamRequestCounts.set(member.username, 0);
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
        const approved = values[member.username + '_approved'] === true;
        const reason = values[member.username + '_reason'];
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

  isPastMonth(month: Date): boolean
  {
    // console.log('am i here??')
    return this.dataService.isPastMonth(month);
  }

  async setData(): Promise<void> {
    if (this.isSettingData) {
      console.log('Already setting data');
      return; // Prevent concurrent calls to setData
    }
    this.isSettingData = true;

    if (this.leader == undefined) {
      this.isSettingData = false;
      throw new Error('Leader undefined');
    }
    await this.setLeaderOvertimes();
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
      const minLimit = (limit?.minHours || 0) < 0 ? 0 : limit?.minHours || 0;
      const maxLimit = (limit?.maxHours || 0) < 0 ? 0 : limit?.maxHours || 0;
      const approved = limit?.statusId === 'A' ? true : false;
      const reason = limit?.reason || '';
      const requestCount = await this.dataService.getRequestCount(member.employeeId, this.selectedMonth);
      
      this.teamRealOvertimes.set(member.username, overtimes);
      this.teamMinLimits.set(member.username, minLimit);
      this.teamMaxLimits.set(member.username, maxLimit);
      this.teamApproved.set(member.username, approved);
      this.teamReason.set(member.username, reason);
      this.teamRequestCounts.set(member.username, requestCount);

      const isPast: boolean = this.isPastMonth(this.selectedMonth);

      // Update form control values
      this.overtimeForm.get(member.username + '_min')?.setValue(minLimit, { emitEvent: false });
      this.overtimeForm.get(member.username + '_max')?.setValue(maxLimit, { emitEvent: false });
      this.overtimeForm.get(member.username + '_approved')?.setValue(approved, { emitEvent: false });
      this.overtimeForm.get(member.username + '_reason')?.setValue(reason, { emitEvent: false });

      if (isPast || !this.editable)
      {
        this.overtimeForm.get(member.username + '_min')?.disable({ emitEvent: false });
        this.overtimeForm.get(member.username + '_max')?.disable({ emitEvent: false });
        this.overtimeForm.get(member.username + '_approved')?.disable({ emitEvent: false });
        this.overtimeForm.get(member.username + '_reason')?.disable({ emitEvent: false });
      }
      else
      {
        this.overtimeForm.get(member.username + '_min')?.enable({ emitEvent: false });
        this.overtimeForm.get(member.username + '_max')?.enable({ emitEvent: false });
        this.overtimeForm.get(member.username + '_reason')?.enable({ emitEvent: false });
        if (this.dataService.userEmployee?.levelRole === 1)
        {
          this.overtimeForm.get(member.username + '_approved')?.enable({ emitEvent: false });
        }
        else
        {
          this.overtimeForm.get(member.username + '_approved')?.disable({ emitEvent: false });
        }
      }

      return { overtimes, minLimit, maxLimit, approved, reason };
    });

    const results = await Promise.all(promises);

    this.recalculateSums();

    this.isSettingData = false;
    
    this.cd.detectChanges();
  }

  async saveLimits(): Promise<void> { 
    const savePromises = this.filteredTeam.map(member => {
      this.dataService.setLimit(member.employeeId, this.selectedMonth, this.teamMinLimits.get(member.username) || 0, this.teamMaxLimits.get(member.username) || 0, this.teamReason.get(member.username) || '');
      this.dataService.setApprovedStatus(member.employeeId, this.leader?.employeeId || 0, this.selectedMonth, (this.teamApproved.get(member.username) || false) ? 'A' : 'W', '');
    });

    await Promise.all(savePromises);
    // await this.setData();
    await this.dataService.setLimit(this.leader?.employeeId || 0, this.selectedMonth, this.leaderMinLimit, this.leaderMaxLimit, this.leaderReason);
    console.log('Leader approved: ', this.leaderApproved);
    await this.dataService.setApprovedStatus(this.leader?.employeeId || 0, this.dataService.userEmployee?.employeeId || 0 , this.selectedMonth, this.leaderApproved ? 'A' : 'W', '');
    this.editable = false;
    this.setData();
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

    this.realOvertimeSum += this.leaderSumOvertimes;
    this.minOvertimeSum += this.leaderMinLimit;
    this.maxOvertimeSum += this.leaderMaxLimit;

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

  async selectEmployee(employee: Employee | undefined): Promise<void> 
  {
    if (employee)
    {
      try
      {
        await this.dataService.setSelectedEmployee(employee.username);
        this.router.navigate(['tl/team/detail'], { queryParams: { source: this.router.url } });
      } catch (error) {
        console.error('Error fetching employee', error);
      }
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

  getOvertimeStatus(teamMember: Employee | undefined): string {
    if (teamMember)
    {
      if ((this.teamRealOvertimes.get(teamMember.username) || 0) < (this.teamMinLimits.get(teamMember.username) || 0)) {
        return 'low-value';
      } else if ((this.teamRealOvertimes.get(teamMember.username) || 0) + ((this.teamMaxLimits.get(teamMember.username) || 0) * 0.1) > (this.teamMaxLimits.get(teamMember.username) || 0)) {
        return 'high-value';
      } else {
        return 'medium-value';
      }
    }
    return '';
  }

  getOvertimeReason(member: Employee, selectedMonth: Date): string {
    return this.teamReason.get(member.username) || '';
  }

  async setLeaderOvertimes(): Promise<void> {
    if (this.leader)
    {
      this.leaderSumOvertimes = await this.dataService.getSumOvertime(this.leader?.employeeId, this.selectedMonth);
      this.leaderMinLimit = await this.dataService.getMinLimit(this.leader.employeeId, this.selectedMonth);
      this.leaderMaxLimit = await this.dataService.getMaxLimit(this.leader.employeeId, this.selectedMonth);
      this.leaderApproved = await this.dataService.getApprovedStatus(this.leader.employeeId, this.selectedMonth);
      this.leaderReason = await this.dataService.getLimitReason(this.leader.employeeId, this.selectedMonth);
      this.leaderRequestCount = await this.dataService.getRequestCount(this.leader.employeeId, this.selectedMonth);
    }
    else
    {
      this.leaderSumOvertimes = 0;
      this.leaderMaxLimit = 0;
      this.leaderMinLimit = 0;
      this.leaderApproved = false;
      this.leaderReason = '';
      this.leaderRequestCount = 0;
    }
  }

  setLeaderMinLimit(event: Event): void 
  {
    const minLimit: number = (event.target as HTMLInputElement).valueAsNumber;
    this.leaderMinLimit = minLimit;
  }

  setLeaderMaxLimit(event: Event): void
  {
    const maxLimit: number = (event.target as HTMLInputElement).valueAsNumber;
    this.leaderMaxLimit = maxLimit;
  }

  setApproved(member: Employee, event: Event): void {
    const approved: boolean = (event.target as HTMLInputElement).checked;
    console.log(`Setting approved for ${member.username}: ${approved}`);
    this.teamApproved.set(member.username, approved);
    console.log(this.teamApproved);
    // this.setData();
    // this.recalculateSums();
  }

  setLeaderApproved(event: Event): void 
  {
    this.leaderApproved = (event.target as HTMLInputElement).checked;
  }



  setReason(member: Employee | undefined, event: Event): void {
    if (!member)
      return;
    const reason: string = (event.target as HTMLInputElement).value;
    this.teamReason.set(member.username, reason);
    // this.setData();
  }

  setLeaderReason(event: Event): void 
  {
    this.leaderReason = (event.target as HTMLInputElement).value;
  }

  onFilteredEmployees(filteredEmployees: Employee[]): void {
    this.filteredTeam = filteredEmployees;
    this.recalculateSums();
  }

  toggleSortByMinLimit(): void
  {
    if (this.minLimitSortState === SortState.ASC)
      this.filteredTeam.sort((a, b) => (this.teamMinLimits.get(a.username) || 0) - (this.teamMinLimits.get(b.username) || 0));
    else if (this.minLimitSortState === SortState.DESC || this.minLimitSortState === SortState.NONE)
      this.filteredTeam.sort((a, b) => (this.teamMinLimits.get(b.username) || 0) - (this.teamMinLimits.get(a.username) || 0));
    this.minLimitSortState = this.minLimitSortState === SortState.ASC ? SortState.DESC : SortState.ASC;

    // if (this.minLimitSortState === SortState.NONE)
    // {
    //   this.minLimitSortState = SortState.ASC;
    //   this.filteredTeam.sort((a, b) => (this.teamMinLimits.get(a.username) || 0) - (this.teamMinLimits.get(b.username) || 0));
    // }
    // else if (this.minLimitSortState === SortState.ASC)
    // {
    //   this.minLimitSortState = SortState.DESC;
    //   this.filteredTeam.sort((a, b) => (this.teamMinLimits.get(b.username) || 0) - (this.teamMinLimits.get(a.username) || 0));
    // }
    // else
    // {
    //   this.minLimitSortState = SortState.NONE;
    //   this.filteredTeam = this.wholeTeam;
    // }
  }

  toggleSortByMaxLimit(): void
  {
    if (this.maxLimitSortState === SortState.ASC)
      this.filteredTeam.sort((a, b) => (this.teamMaxLimits.get(a.username) || 0) - (this.teamMaxLimits.get(b.username) || 0));
    else if (this.maxLimitSortState === SortState.DESC || this.maxLimitSortState === SortState.NONE)
      this.filteredTeam.sort((a, b) => (this.teamMaxLimits.get(b.username) || 0) - (this.teamMaxLimits.get(a.username) || 0));
    this.maxLimitSortState = this.maxLimitSortState === SortState.ASC ? SortState.DESC : SortState.ASC

    // if (this.maxLimitSortState === SortState.NONE)
    // {
    //   this.maxLimitSortState = SortState.ASC;
    //   this.filteredTeam.sort((a, b) => (this.teamMaxLimits.get(a.username) || 0) - (this.teamMaxLimits.get(b.username) || 0));
    // }
    // else if (this.maxLimitSortState === SortState.ASC)
    // {
    //   this.maxLimitSortState = SortState.DESC;
    //   this.filteredTeam.sort((a, b) => (this.teamMaxLimits.get(b.username) || 0) - (this.teamMaxLimits.get(a.username) || 0));
    // }
    // else
    // {
    //   this.maxLimitSortState = SortState.NONE;
    //   this.filteredTeam = this.wholeTeam;
    // }
  }

  toggleSortByRealOvertimes(): void
  {
    if (this.realOvertimesSortState === SortState.ASC)
      this.filteredTeam.sort((a, b) => (this.teamRealOvertimes.get(a.username) || 0) - (this.teamRealOvertimes.get(b.username) || 0));
    else if (this.realOvertimesSortState === SortState.DESC || this.realOvertimesSortState === SortState.NONE)
      this.filteredTeam.sort((a, b) => (this.teamRealOvertimes.get(b.username) || 0) - (this.teamRealOvertimes.get(a.username) || 0));
    this.realOvertimesSortState = this.realOvertimesSortState === SortState.ASC ? SortState.DESC : SortState.ASC;
  }

  toggleSortByApproved(): void
  {
    if (this.approvedSortState === SortState.ASC)
      this.filteredTeam.sort((a, b) => (this.teamApproved.get(a.username) || false) ? 1 : -1);
    else if (this.approvedSortState === SortState.DESC || this.approvedSortState === SortState.NONE)
      this.filteredTeam.sort((a, b) => (this.teamApproved.get(b.username) || false) ? 1 : -1);
    this.approvedSortState = this.approvedSortState === SortState.ASC ? SortState.DESC : SortState.ASC;
  }

  toggleSortByLastname(): void
  {
    if (this.lastNameSortState === SortState.ASC)
      this.filteredTeam.sort((a, b) => a.lastName.localeCompare(b.lastName));
    else if (this.lastNameSortState === SortState.DESC || this.lastNameSortState === SortState.NONE)
      this.filteredTeam.sort((a, b) => b.lastName.localeCompare(a.lastName));
    this.lastNameSortState = this.lastNameSortState === SortState.ASC ? SortState.DESC : SortState.ASC;
  }

  isPastDeadline(): boolean
  {
    return this.isPastDeadlineValue;
  }

  async openChangeRequests(employee?: Employee): Promise<void>
  {
    if (employee)
      {
        try
        {
          await this.dataService.setSelectedEmployee(employee.username);
          this.router.navigate(['tl/team/detail'], { queryParams: { source: this.router.url, action: 'showChangeRequests' } });
        } catch (error) {
          console.error('Error fetching employee', error);
        }
      }
  }

  // getRequestCount(employee: Employee, month: Date): number
  // {
  //   return this.dataService.getRequestCount(employee.employeeId, month);
  // }
}
