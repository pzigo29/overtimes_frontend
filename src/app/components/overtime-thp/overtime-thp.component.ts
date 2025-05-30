import { ChangeDetectorRef, Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser, KeyValue } from '@angular/common';
import { TitleBarComponent } from "../shared-components/title-bar/title-bar.component";
import { MonthsTableComponent } from "../shared-components/months-table/months-table.component";
import { Employee, Overtime, OvertimeLimit } from '../../models/data.model';
import { DataService } from '../../services/data.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-overtime-thp',
    standalone: true,
    imports: [FormsModule, CommonModule, TitleBarComponent, MonthsTableComponent, TranslateModule, MatSnackBarModule],
    templateUrl: './overtime-thp.component.html',
    styleUrl: './overtime-thp.component.scss'
})

export class OvertimeThpComponent implements OnInit {
  title: string = 'MY-OVERTIMES';
  employee?: Employee;
  isTableVisible: boolean = true;
  realOvertime: number = 0;
  minOvertime: number = 0;
  maxOvertime: number = 0;
  overtimeReason: string = '';
  approved: boolean = false; //this.dataService.getApproval(limit_id);
  loading: boolean = true;
  selectedMonth: Date = new Date();

  isOvertimesInfoPopupVisible: boolean = false;

  notNullYears: Map<number, number> = new Map();
  notNullYearsLoaded: boolean = false;
  // sumOvertimeYears: number[] = []; // pridat sumOvertimeYears

  shownOvertimeLimitChangeRequest: boolean = false;
  isPastDeadlineValue: boolean = true;

  name: string = '';

  constructor(private dataService: DataService, private cd: ChangeDetectorRef, private snackBar: MatSnackBar, private translate: TranslateService) { }

  async ngOnInit() {
    this.loading = true; // Start loading state
    
    try {
      let username: string | null = null;
      while (!this.dataService.initialized) {
        console.log('Waiting for DataService to initialize...');
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms
      }
      console.log('DataService initialized: ', this.dataService.initialized);
      this.dataService.initialized = false; // Reset initialized flag
      username = await firstValueFrom(this.dataService.getThpUsername());
      this.isPastDeadlineValue = await this.dataService.isPastDeadline();
      console.log('isPastDeadlineValue:', this.isPastDeadlineValue);
      if (username) {
        console.log('Fetched username:', username);
        this.employee = await firstValueFrom(this.dataService.getEmployee(username));
        this.cd.detectChanges();
        console.log('Employee received from service:', this.employee);
        this.name = this.employee?.firstName || '';
        if (this.employee) {
          const years: number[] = await this.dataService.getNotNullYears(this.employee.employeeId);
          for (const year of years)
          {
            const sumOvertimes: number = await this.dataService.getSumOvertimesYear(this.employee.employeeId, year);
            this.notNullYears.set(year, sumOvertimes);
          }
          this.dataService.selectedMonth$.subscribe(month => {
            this.selectedMonth = month; // Update selected month
            this.setData(); // Call setData only if employee is defined
          });
          this.notNullYearsLoaded = true;
        } else {
          console.error('Employee is undefined for username:', username);
        }
      } else {
        console.error('No username found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.loading = false; // End loading state
    }
  }

  fetchMessage(): void
  {
    this.dataService.getEmployee('zigopvo').subscribe(
      (data: Employee | undefined) => {
        console.log(data);
      },
      (error: any) => {
        console.error('Error fetching message', error);
      }
    );
  }

  isPastMonth(month: Date): boolean
  {
    return this.dataService.isPastMonth(month);
  }

  isPastDeadline(): boolean
  {
    // let isPast = true;
    // console.log('isPastDeadline()', isPast);
    // this.dataService.isPastDeadline().then(result => isPast = result).catch(error => console.error(error));
    return this.isPastDeadlineValue;
  }

  async setData()
  {
    if (this.employee == undefined)
      throw new Error('Employee undefined');
    console.log('setData(): ' + JSON.stringify(this.employee) );
    this.realOvertime = await this.dataService.getSumOvertime(this.employee.employeeId, this.selectedMonth);
    this.minOvertime = await this.dataService.getMinLimit(this.employee.employeeId, this.selectedMonth);
    this.maxOvertime = await this.dataService.getMaxLimit(this.employee.employeeId, this.selectedMonth);
    this.approved = await this.dataService.getApprovedStatus(this.employee.employeeId, this.selectedMonth);
    this.overtimeReason = await this.dataService.getLimitReason(this.employee.employeeId, this.selectedMonth);
    //console.log('data: ', this.realOvertime, this.minOvertime, this.maxOvertime, this.approved);
  }

  async saveLimits(): Promise<void>
  {
    const close = this.translate.instant('CLOSE');
    try
    {
      if (!this.isPastDeadlineValue)
      {
        await this.dataService.setLimit(this.employee?.employeeId || 0, this.selectedMonth, this.minOvertime, this.maxOvertime, this.overtimeReason);
      }
      else
      {
        const minLimit = (document.getElementById('requestMinLimit') as HTMLInputElement).value;
        const maxLimit = (document.getElementById('requestMaxLimit') as HTMLInputElement).value;
        const reason = (document.getElementById('requestReason') as HTMLInputElement).value;
        await this.dataService.postLimitRequest(this.employee?.employeeId || 0, this.selectedMonth, +minLimit, +maxLimit, reason);
        this.shownOvertimeLimitChangeRequest = false;
      }
      const goodMessage = this.translate.instant('SAVED-LIMITS');
      console.log('mal by sa objaviť snackbar');
      this.snackBar.open(goodMessage, close, {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['snackbar-success', 'snackbar'],
      });
    }
    catch (error)
    {
      console.error('Error saving limits:', error);
      const badMessage = this.translate.instant('ERROR-SAVING');

      this.snackBar.open(badMessage, close, {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['snackbar-error', 'snackbar'],
      });
    }
  }

  showOvertimeLimitChangeRequest(): void
  {
    this.shownOvertimeLimitChangeRequest = true;
  }

  hideOvertimeLimitChangeRequest(): void
  {
    this.shownOvertimeLimitChangeRequest = false;
  }

  isSidebarActive(): boolean 
  {
    //console.log('Sidebar: ', this.realOvertime);
    return TitleBarComponent.isSidebarActive;
  }

  isSidebarVisible(): boolean 
  {
    //console.log('Sidebar: ', this.realOvertime);
    return TitleBarComponent.isSidebarVisible;
  }

  getOvertimeStatus(): string 
  {
    //console.log('Overtime status: ', this.realOvertime);
    if (this.realOvertime < this.minOvertime) {
      return 'low-value';
    } else if (this.realOvertime + (this.maxOvertime * 0.1) > this.maxOvertime) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }

  toggleTableOrForm(): void 
  {
    // const table = document.getElementById('limits-table') as HTMLTableElement;

    // if (document.body.scrollWidth > window.innerWidth)
    // {
    //   table.style.display = 'none';
    // }
    // else
    // {
    //   table.style.display = 'table';
    // }
    const bodyWidth = document.body.scrollWidth;
    const windowWidth = window.innerWidth;

    this.isTableVisible = bodyWidth <= windowWidth;
    //console.log('Toggle table: ', this.realOvertime);
  }

  showOvertimesInfoPopup(): void
  {
    this.isOvertimesInfoPopupVisible = true;
  }

  hideOvertimesInfoPopup(): void
  {
    this.isOvertimesInfoPopupVisible = false;
  }

  showWF(): void
  {
    // alert('Not implemented yet!');
    const pdfUrl = '/assets/workflow.pdf';
    window.open(pdfUrl, '_blank');
  }

  async getNotNullYears(): Promise<number[]>
  {
    if (!this.employee?.employeeId) {
      throw new Error('Employee ID is undefined');
    }
    return await this.dataService.getNotNullYears(this.employee.employeeId);
  }

  sortByKeyDescending = (a: KeyValue<number, number>, b: KeyValue<number, number>): number => 
  {
    return b.key - a.key;
  };

  // async getSumOvertimesYear(year: number): Promise<number>
  // {
  //   console.log('am i getting sumOvertimesYear??');
  //   if (!this.employee?.employeeId) {
  //     throw new Error('Employee ID is undefined');
  //   }
  //   return await this.dataService.getSumOvertimesYear(this.employee.employeeId, year);
  // }

  // calculateHoursToLimit(): void {
  //   this.hoursToLimit = this.overtimeMaxLimit - this.realOvertime;
  // }
}
