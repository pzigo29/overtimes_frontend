import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TitleBarComponent } from '../shared-components/title-bar/title-bar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Employee, NonFulfilledOvertimes, Overtime } from '../../models/data.model';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-stats-panel',
    imports: [TitleBarComponent, TranslateModule, CommonModule, NgxChartsModule, FormsModule],
    templateUrl: './stats-panel.component.html',
    styleUrls: ['./stats-panel.component.scss']
})
export class StatsPanelComponent implements OnInit {
  months: Date[] = [];
  selectedMonth: Date = new Date();
  dateFilter: string = 'year';
  personalNumbers: string = '';
  selectedDate: Date = new Date();
  employeeAvg: number = 0;
  nonFulfilledLimits?: NonFulfilledOvertimes;
  exceededRuleLimitsData: any[] = [];
  selectedEmployee?: Employee;
  shownEmployeeAvg: boolean = false;
  shownNonFulfilledLimits: boolean = false;
  selectedSegmentManager?: Employee; 
  selectedDepartment?: string;
  segmentManagers: Employee[] = [];
  nonFulfilledLimitsData: any[] = [];
  departments: string[] = [];
  statTypes: string[] = ['NON-FULFILLED', 'EXCEEDED-RULE', 'LONGTERM-OVERTIMES'];
  selectedStatType?: string;
  shownCustomTimeSelection: boolean = false;
  departmentOrEmployee: string = '';
  customTimeOvertimes: Overtime[] = [];
  customTimeOvertimesData: any[] = [];

  constructor(private dataService: DataService, private translate: TranslateService) {}

  async ngOnInit(): Promise<void> {
    this.departmentOrEmployee = await firstValueFrom(this.translate.get('EMPLOYEE'));
    this.dataService.getMonths().subscribe(
      (months) => {
        this.months = months;
    });

    this.dataService.getRndMng().subscribe(
      (rndMng: Employee) => {
        this.dataService.getSegmentManagers(rndMng.employeeId).subscribe(
          (data: Employee[]) => {
            console.log(data);
            this.segmentManagers = data;
            console.log('sgmt', this.segmentManagers);
            // Initialize selectedSegmentManager to the first manager
            if (this.segmentManagers.length > 0) 
            {
              this.selectedSegmentManager = this.segmentManagers[0];
            }
          },
          (error) => {
            console.error('Error fetching segment managers:', error);
          }
        );
        this.segmentManagers.push(rndMng);
        this.dataService.getDepartments().subscribe(
          (data: string[]) => {
            console.log(data);
            this.departments = data;
            this.getNonFulfilledLimits();
          },
          (error: any) => {
            console.error('Error fetching departments:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching R&D manager:', error);
      }
    );
  }

  filterMonth(month: Date) 
  {
    this.selectedMonth = month;  
  }

  async getEmployeeAverage(personalNumbers: string, filter: string, date: Date): Promise<void>
  {
    console.log(date);
    if (!(date instanceof Date) && date == '')
    {
      date = new Date();
    }
    let stringDate: string = date.toString();
    if (date instanceof Date)
      stringDate = date.toISOString().split('T')[0];
    let avg: number = 0;
    avg = await this.dataService.getEmployeeAverage(personalNumbers, filter, stringDate);
    this.dateFilter = filter;
    this.selectedEmployee = await this.dataService.getEmployeeByPersonalNumber(personalNumbers);
    console.log(avg);
    this.employeeAvg = avg;
    // return avg;
  }

  async getNonFulfilledLimits(): Promise<void> {
    let date = new Date();
    const selectedDateElement = document.getElementById('selectedDateNonFulfilled') as HTMLInputElement;
    if (selectedDateElement) {
      date = new Date(selectedDateElement.value);
    }
    console.log('Input date:', date);
    
    if (!(date instanceof Date) || (date == null)) {
      date = new Date();
    }
  
    let stringDate: string = date.toISOString().split('T')[0];

    const statTypeElement = document.getElementById('statType') as HTMLSelectElement;
    let statType: string = '';
    if (!statTypeElement) 
    {
      statType = await firstValueFrom(this.translate.get(this.statTypes[0]));
    }
    else
    {
      statType = statTypeElement.value;
    }

    const translatedStatType = await this.translate.get(statType).toPromise();
    this.selectedStatType = translatedStatType;
    console.log('Selected statType:', translatedStatType);

    switch (translatedStatType) {
      case await this.translate.get('NON-FULFILLED').toPromise():
        this.nonFulfilledLimits = await this.dataService.getNonFulfilledLimits(stringDate, this.selectedDepartment);
        this.transformNonFulfilledLimitsData();
        break;
      case await this.translate.get('EXCEEDED-RULE').toPromise():
        const limit: number = parseInt((document.getElementById('exceededRuleType') as HTMLSelectElement).value, 10);
        console.log('Selected limit:', limit);
        const exceededRuleLimits = await this.dataService.getExceededLawLimits(stringDate, limit, this.selectedDepartment);
        console.log('Received exceededRuleLimits:', exceededRuleLimits);
        this.transformExceededRuleLimitsData(exceededRuleLimits);
        break;
      case await this.translate.get('LONGTERM-OVERTIMES').toPromise():
        // this.nonFulfilledLimits = await this.dataService.getLongtermOvertimesLimits(stringDate, this.selectedDepartment);
        break;
      default:
        console.error('Unexpected statType:', translatedStatType);
        break;
    }
  }

  transformNonFulfilledLimitsData(): void {
    if (this.nonFulfilledLimits && typeof this.nonFulfilledLimits.percentage === 'number') {
      const nonFulfilledLabel: string = this.translate.instant('NON-FULFILLED');
      const fulfilledLabel: string = this.translate.instant('FULFILLED');
  
      const nonFulfilledPercentage = Math.max(0, Math.min(100, this.nonFulfilledLimits.percentage));
      const fulfilledPercentage = 100 - nonFulfilledPercentage;
  
      this.nonFulfilledLimitsData = [
        {
          "name": nonFulfilledLabel,
          "value": nonFulfilledPercentage
        },
        {
          "name": fulfilledLabel,
          "value": fulfilledPercentage
        }
      ];
    } else {
      console.error('Unexpected nonFulfilledLimits structure:', this.nonFulfilledLimits);
    }
  }

  transformExceededRuleLimitsData(exceededRuleLimits: any): void {
    if (exceededRuleLimits && typeof exceededRuleLimits.percentage === 'number') {
      const exceededLabel: string = this.translate.instant('EXCEEDED-RULE');
      const notExceededLabel: string = this.translate.instant('NOT-EXCEEDED');
  
      const exceededPercentage = Math.max(0, Math.min(100, exceededRuleLimits.percentage));
      const notExceededPercentage = 100 - exceededPercentage;
  
      this.exceededRuleLimitsData = [
        {
          "name": exceededLabel,
          "value": exceededPercentage
        },
        {
          "name": notExceededLabel,
          "value": notExceededPercentage
        }
      ];
      console.log('Exceeded rule limits data:', this.exceededRuleLimitsData);
    } else {
      console.error('Unexpected exceededRuleLimits structure:', exceededRuleLimits);
    }
  }

  async getCustomTimeOvertimes(): Promise<void>
  {
    let startDate = new Date();
    let endDate = new Date();
    const startDateElement = document.getElementById('selectedCustomStartDate') as HTMLInputElement;
    const endDateElement = document.getElementById('selectedCustomEndDate') as HTMLInputElement;

    // let startDate = new Date(startDateElement.value);
    // let endDate = new Date(endDateElement.value);
    if (startDateElement && endDateElement) {
      console.log('Start date:', startDateElement.value);
      console.log('End date:', endDateElement.value);
      startDate = new Date(startDateElement.value);
      endDate = new Date(endDateElement.value);
    }

    if (!(startDate instanceof Date) || (startDate == null)) {
      startDate = new Date();
    }
    if (!(endDate instanceof Date) || (endDate == null)) {
      endDate = new Date();
    }

    const stringStartDate = startDate.toISOString().split('T')[0];
    const stringEndDate = endDate.toISOString().split('T')[0];
    if ((await firstValueFrom(this.translate.get(this.departmentOrEmployee))) === await firstValueFrom(this.translate.get('EMPLOYEE'))) 
    {
      const personalNumberElement = document.getElementById('personalNumbersCustomTime') as HTMLInputElement;
      console.log('Personal number :', personalNumberElement.value);
      if (personalNumberElement) {
        this.customTimeOvertimes = await this.dataService.getCustomTimeOvertimes(stringStartDate, stringEndDate, personalNumberElement.value);
      }
    }
    else if ((await firstValueFrom(this.translate.get(this.departmentOrEmployee))) === await firstValueFrom(this.translate.get('DEPARTMENT'))) 
    {
      console.log('am i here in department?');
      const departmentElement = document.getElementById('departmentsSelectCustomTime') as HTMLSelectElement;
      if (departmentElement) {
        this.customTimeOvertimes = await this.dataService.getCustomTimeOvertimes(stringStartDate, stringEndDate, undefined, departmentElement.value);
      }
    }
    console.log('Custom time overtimes:', this.customTimeOvertimes);
    this.transformCustomTimeOvertimesData();
  }

  transformCustomTimeOvertimesData(): void 
  {
    if (this.customTimeOvertimes && this.customTimeOvertimes.length > 0) {
      const transformedData = this.customTimeOvertimes.map(overtime => ({
        name: overtime.overtimeDay,
        value: overtime.overtimeHours
      }));

      this.customTimeOvertimesData = [
        {
          name: this.departmentOrEmployee,
          series: transformedData
        }
      ];
      console.log('Transformed custom time overtimes data:', this.customTimeOvertimesData);
    } else {
      console.error('Unexpected customTimeOvertimes structure:', this.customTimeOvertimes);
    }
  }

  getCurrentDate(): string
  {
    return new Date().toISOString().split('T')[0];
  }

  selectSegmentManager(event: Event): void
  {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex;
    this.selectedSegmentManager = this.segmentManagers[selectedIndex];
    console.log('Selected Segment Manager:', this.selectedSegmentManager);
  }

  selectDepartment(event: Event): void
  {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex - 1;
    this.selectedDepartment = this.departments[selectedIndex];
  }

  async selectStatType(event: Event): Promise<void> {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex;
    this.selectedStatType = await firstValueFrom(this.translate.get(this.statTypes[selectedIndex]));
    console.log('Selected statType:', this.selectedStatType);
  }

  selectDepartmentOrEmployee(event: Event): void
  {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    this.departmentOrEmployee = selectedValue;
    console.log('Selected departmentOrEmployee:', this.departmentOrEmployee);
  }

  trackByManagerId(index: number, manager: Employee): number {
    return manager.employeeId;
  }

  trackByDepartment(index: number, department: string): string {
    return department;
  }

  trackByStatType(index: number, statType: string): string {
    return statType;
  }

  customTooltipTemplate(data: any): string
  {
    if (data && data.data && data.data.name && data.data.value !== undefined) {
      return `${data.data.name}: ${data.data.value.toLocaleString()}%`;
    } else {
      console.error('Invalid data for tooltip:', data);
      return '';
    }
  }

  toggleEmployeeAvg(): void
  {
    this.shownEmployeeAvg = !this.shownEmployeeAvg;
  }

  toggleNonFulfilledLimits(): void
  {
    this.shownNonFulfilledLimits = !this.shownNonFulfilledLimits;
  }

  toggleCustomTimeSelection(): void
  {
    this.shownCustomTimeSelection = !this.shownCustomTimeSelection;
  }
}
