import { Component, OnInit } from '@angular/core';
import { TitleBarComponent } from '../shared-components/title-bar/title-bar.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Employee } from '../../models/data.model';

@Component({
    selector: 'app-stats-panel',
    standalone: true,
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
  selectedEmployee?: Employee;
  shownEmployeeAvg: boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void 
  {
    this.dataService.getMonths().subscribe(
      (months) => {
        this.months = months;
    });
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

  toggleEmployeeAvg(): void
  {
    this.shownEmployeeAvg = !this.shownEmployeeAvg;
  }
}
