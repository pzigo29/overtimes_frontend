import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TitleBarComponent } from '../shared-components/title-bar/title-bar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Employee, NonFulfilledOvertimes } from '../../models/data.model';

@Component({
    selector: 'app-stats-panel',
    standalone: true,
    imports: [TitleBarComponent, TranslateModule, CommonModule, NgxChartsModule, FormsModule],
    templateUrl: './stats-panel.component.html',
    styleUrls: ['./stats-panel.component.scss']
})
export class StatsPanelComponent implements OnInit {
  // @ViewChild('customTooltipTemplate', { static: true }) customTooltipTemplate!: TemplateRef<any>;
  
  months: Date[] = [];
  selectedMonth: Date = new Date();
  dateFilter: string = 'year';
  personalNumbers: string = '';
  selectedDate: Date = new Date();
  employeeAvg: number = 0;
  nonFulfilledLimits?: NonFulfilledOvertimes;
  selectedEmployee?: Employee;
  shownEmployeeAvg: boolean = false;
  shownNonFulfilledLimits: boolean = false;
  selectedSegmentManager?: Employee; 
  segmentManagers: Employee[] = [];
  nonFulfilledLimitsData: any[] = [];

  constructor(private dataService: DataService, private translate: TranslateService) {}

  ngOnInit(): void {
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
            if (this.segmentManagers.length > 0) {
              this.selectedSegmentManager = this.segmentManagers[0];
            }
          },
          (error) => {
            console.error('Error fetching segment managers:', error);
          }
        );
        this.segmentManagers.push(rndMng);
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

  async getNonFulfilledLimits(date: Date): Promise<void> {
    console.log('Input date:', date);
    
    if (!(date instanceof Date) || (date == null)) {
      date = new Date();
    }
  
    let stringDate: string = date.toISOString().split('T')[0];
    
    this.nonFulfilledLimits = await this.dataService.getNonFulfilledLimits(stringDate, this.selectedSegmentManager?.employeeId);
    console.log('Received nonFulfilledLimits:', this.nonFulfilledLimits);
  
    if (this.nonFulfilledLimits && typeof this.nonFulfilledLimits.percentage === 'number') {
      const nonFulfilledLabel: string = await this.translate.get('NON-FULFILLED').toPromise();
      const fulfilledLabel: string = await this.translate.get('FULFILLED').toPromise();
  
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

  // getSegmentManagers(): void
  // {
    
  //   // let segmentManagers: Employee[] = [];
  //   this.dataService.getSegmentManagers(rndMng.employeeId).subscribe(
  //     (data: Employee[]) => {
  //       console.log(data);
  //       this.segmentManagers = data;
  //     }
  //   );
  // }

  selectSegmentManager(event: Event): void
  {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex;
    this.selectedSegmentManager = this.segmentManagers[selectedIndex];
    console.log('Selected Segment Manager:', this.selectedSegmentManager);
  }

  trackByManagerId(index: number, manager: Employee): number {
    return manager.employeeId;
  }

  customTooltipTemplate(data: any): string
  {
    // console.log('tooltip data: ', data);
    if (data && data.data && data.data.name && data.data.value !== undefined) {
      // console.log(`${data.data.name}: ${data.data.value.toLocaleString()}%`);
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
}
