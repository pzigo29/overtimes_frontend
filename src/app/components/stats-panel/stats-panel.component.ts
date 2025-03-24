import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TitleBarComponent } from '../shared-components/title-bar/title-bar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Employee, MonthOvertime, NonFulfilledOvertimes, Overtime, Month, OvertimeType } from '../../models/data.model';
import { firstValueFrom } from 'rxjs';
import e from 'express';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { startOfWeek, parseISO } from 'date-fns';

import '../../../assets/Roboto_Condensed-Black-normal.js';

@Component({
    selector: 'app-stats-panel',
    imports: [TitleBarComponent, TranslateModule, CommonModule, NgxChartsModule, FormsModule],
    animations: [
      trigger('animationState', [
        state('state1', style({ opacity: 1 })),
        state('state2', style({ opacity: 0 })),
        transition('state1 <=> state2', animate('300ms ease-in-out'))
      ])
    ],
    templateUrl: './stats-panel.component.html',
    styleUrls: ['./stats-panel.component.scss']
})
export class StatsPanelComponent implements OnInit {
  months: Date[] = [];
  selectedYear: string = new Date().getFullYear().toString();
  selectedMonth: string = new Date().toISOString().slice(0, 7); // YYYY-MM
  selectedWeek: string = this.getCurrentWeek(); // YYYY-WXX
  selectedMonthNonFulfilled: string = new Date().toISOString().slice(0, 7); // YYYY-MM
  selectedYearNonFulfilled: string = new Date().getFullYear().toString();
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
  selectedDepartmentAvg?: string;
  segmentManagers: Employee[] = [];
  nonFulfilledLimitsData: any[] = [];
  departments: string[] = [];
  statTypes: string[] = [];
  customTimeTypes: string[] = [];
  selectedStatType?: string;
  shownCustomTimeSelection: boolean = false;
  departmentOrEmployee: string = '';
  departmentOrEmployeeAvg: string = '';
  hoursOrType: string = '';
  customTimeOvertimes: Overtime[] = [];
  customTimeOvertimesData: any[] = [];
  customTimeOvertimesTypesData: any[] = [];
  xScaleMin?: Date = new Date(new Date().getFullYear(), 0, 1);
  xScaleMax?: Date = new Date(new Date().getFullYear(), 11, 31);
  shownMaxMonth: boolean = false;
  maxMonthOvertimes?: MonthOvertime;
  shownOvertimeTypes: boolean = false;

  loading: boolean = true;

  constructor(private dataService: DataService, private translate: TranslateService, private cdr: ChangeDetectorRef) 
  {
    translate.onLangChange.subscribe(() => {
      this.loadTranslations();
    });
  }

  getCurrentWeek(): string {
    const date = new Date();
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  private async loadTranslations(): Promise<void> 
  {
    this.statTypes = [
      await firstValueFrom(this.translate.get('LIMITS.NOT-FULFILLED')),
      await firstValueFrom(this.translate.get('EXCEEDED-RULE')),
      // await firstValueFrom(this.translate.get('LONGTERM-OVERTIMES'))
    ];
    this.departmentOrEmployee = await firstValueFrom(this.translate.get('EMPLOYEE'));
    this.departmentOrEmployeeAvg = await firstValueFrom(this.translate.get('EMPLOYEE'));
    this.hoursOrType = await firstValueFrom(this.translate.get('OVERTIME-HOURS'));
    this.dataService.getMonths().subscribe(
      async (months) => {
      this.departmentOrEmployee = await firstValueFrom(this.translate.get('EMPLOYEE'));
      this.customTimeTypes = [
        this.translate.instant('OVERTIME-HOURS'), 
        this.translate.instant('OVERTIMES-TYPES-SHARES')
      ];
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadTranslations();

    if (!this.dataService.userEmployee)
      return;
    this.dataService.getEmployee(this.dataService.userEmployee.username).subscribe(
      (mng?: Employee) => {
        // this.dataService.getSegmentManagers(rndMng.employeeId).subscribe(
        //   (data: Employee[]) => {
        //     console.log(data);
        //     this.segmentManagers = data;
        //     console.log('sgmt', this.segmentManagers);
        //     // Initialize selectedSegmentManager to the first manager
        //     if (this.segmentManagers.length > 0) 
        //     {
        //       this.selectedSegmentManager = this.segmentManagers[0];
        //     }
        //   },
        //   (error) => {
        //     console.error('Error fetching segment managers:', error);
        //   }
        // );
        // this.segmentManagers.push(rndMng);
        if (!mng || mng.levelRole > 4)
        {
          this.loading = true;
          alert('Not a manager! Redirecting to the homepage.');
          window.location.href = '/';
          return;
        }
        else
        {
          this.loading = false;
        }
        this.dataService.getDepartments(mng?.employeeId).subscribe(
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

  // filterMonth(month: Date) 
  // {
  //   this.selectedMonth = month;  
  // }

  async getEmployeeAverage(filter: string, personalNumbers?: string, department?: string): Promise<void>
  {
    let date: string;
    switch (filter) {
      case 'year':
        date = `${this.selectedYear}-01-01`;
        break;
      case 'month':
        date = this.selectedMonth;
        break;
      case 'week':
        const [year, week] = this.selectedWeek.split('-W');
        const firstDayOfWeek = startOfWeek(parseISO(`${year}-01-01`), { weekStartsOn: 2 });
        const weekDate = new Date(firstDayOfWeek.setDate(firstDayOfWeek.getDate() + (parseInt(week) - 1) * 7));
        date = weekDate.toISOString().split('T')[0];
        break;
      default:
        date = this.selectedYear;
    }
    console.log('Date:', date);
    console.log('Department:', department);
    let avg: number = 0;
    if (this.departmentOrEmployeeAvg === await firstValueFrom(this.translate.get('EMPLOYEE')))
    {
      department = undefined;
    }
    else if (this.departmentOrEmployeeAvg === await firstValueFrom(this.translate.get('DEPARTMENT')))
    {
      personalNumbers = undefined;
    }
    else
    {
      console.error('Unexpected departmentOrEmployeeAvg:', this.departmentOrEmployeeAvg);
      department = undefined;
      personalNumbers = undefined;
    }
    console.log('departmentOrEmployeeAvg is: ', this.departmentOrEmployeeAvg);
    if (department !== undefined && department.length > 0)
    {
      if (department === 'ALL') 
      {
        department = undefined;
      }
      avg = await this.dataService.getDepartmentAverage(filter, date, department);
      this.dateFilter = filter;
      // this.selectedDepartmentAvg = department;
    }
    else if (personalNumbers !== undefined && personalNumbers.length > 0 ) 
    {
      const hierarchy: Employee[] = await this.dataService.getHierarchy(this.dataService.userEmployee?.employeeId ?? -1);
      if (hierarchy.find(emp => emp.personalNumber === personalNumbers))
      {
        avg = await this.dataService.getEmployeeAverage(personalNumbers, filter, date);
        this.dateFilter = filter;
        this.selectedEmployee = await this.dataService.getEmployeeByPersonalNumber(personalNumbers);
      }
      else
      {
        alert('Employee is not in your hierarchy!');
      }
    }
    console.log('Avg: ', avg);
    this.employeeAvg = avg;
    // return avg;
  }

  async getNonFulfilledLimits(): Promise<void> {
    let date: string;
    if (this.selectedStatType === await firstValueFrom(this.translate.get('LIMITS.NOT-FULFILLED'))) {
      date = this.selectedMonthNonFulfilled;
    } else if (this.selectedStatType === await firstValueFrom(this.translate.get('EXCEEDED-RULE'))) {
      date = `${this.selectedYearNonFulfilled}-01-01`;
    } else {
      date = this.selectedMonthNonFulfilled;
    }
    console.log('Date:', date);
    // const selectedDateElement = document.getElementById('selectedDateNonFulfilled') as HTMLInputElement;
    // if (selectedDateElement) {
    //   date = new Date(selectedDateElement.value);
    // }
    // console.log('Input date:', date);
    
    // if (!(date instanceof Date) || (date == null)) {
    //   date = new Date();
    // }
  
    // let stringDate: string = date.toISOString().split('T')[0];

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
      case await this.translate.get('LIMITS.NOT-FULFILLED').toPromise():
        this.nonFulfilledLimits = await this.dataService.getNonFulfilledLimits(date, this.selectedDepartment);
        this.transformNonFulfilledLimitsData();
        break;
      case await this.translate.get('EXCEEDED-RULE').toPromise():
        const limit: number = parseInt((document.getElementById('exceededRuleType') as HTMLSelectElement).value, 10);
        console.log('Selected limit:', limit);
        const exceededRuleLimits = await this.dataService.getExceededLawLimits(date, limit, this.selectedDepartment);
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
    this.customTimeOvertimes = [];
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

    this.xScaleMin = startDate;
    this.xScaleMax = endDate;

    console.log('x scale min:', this.xScaleMin);
    console.log('x scale max:', this.xScaleMax);

    const stringStartDate = startDate.toISOString().split('T')[0];
    const stringEndDate = endDate.toISOString().split('T')[0];
    try 
    {
      if ((await firstValueFrom(this.translate.get(this.departmentOrEmployee))) === await firstValueFrom(this.translate.get('EMPLOYEE'))) 
        {
          const personalNumberElement = document.getElementById('personalNumbersCustomTime') as HTMLInputElement;
          console.log('Personal number :', personalNumberElement.value);
          const hierarchy: Employee[] = await this.dataService.getHierarchy(this.dataService.userEmployee?.employeeId ?? -1);
          if (personalNumberElement && hierarchy.find(emp => emp.personalNumber === personalNumberElement.value)) 
          {
            this.customTimeOvertimes = await this.dataService.getCustomTimeOvertimes(stringStartDate, stringEndDate, personalNumberElement.value);
          }
          else
          {
            alert('Invalid employee!');
          }
        }
        else if ((await firstValueFrom(this.translate.get(this.departmentOrEmployee))) === await firstValueFrom(this.translate.get('DEPARTMENT'))) 
        {
          console.log('am i here in department?');
          const departmentElement = document.getElementById('departmentsSelectCustomTime') as HTMLSelectElement;
          if (departmentElement) {
            if (!this.departments.includes(departmentElement.value)) {
              this.customTimeOvertimes = await this.dataService.getCustomTimeOvertimes(stringStartDate, stringEndDate, undefined, 'ALL');
            } else {
              this.customTimeOvertimes = await this.dataService.getCustomTimeOvertimes(stringStartDate, stringEndDate, undefined, departmentElement.value);
            }
          }
        }
    }
    catch (error) 
    {
      this.customTimeOvertimes = [];
      console.error('Error fetching custom time overtimes:', error);
    }
    
    console.log('Custom time overtimes:', this.customTimeOvertimes);
    this.transformCustomTimeOvertimesData();
    this.cdr.detectChanges();
  }

  // transformCustomTimeOvertimesData(): void 
  // {
  //   if (this.customTimeOvertimes && this.customTimeOvertimes.length > 0) {
  //     const transformedData = this.customTimeOvertimes.map(overtime => ({
  //       name: overtime.overtimeDay,
  //       value: overtime.overtimeHours
  //     }));

  //     this.customTimeOvertimesData = [
  //       {
  //         name: this.departmentOrEmployee,
  //         series: transformedData
  //       }
  //     ];
  //     console.log('Transformed custom time overtimes data:', this.customTimeOvertimesData);
  //   } else {
  //     console.error('Unexpected customTimeOvertimes structure:', this.customTimeOvertimes);
  //   }
  // }

  async transformCustomTimeOvertimesData(): Promise<void> {
    if (this.hoursOrType === await firstValueFrom(this.translate.get('OVERTIME-HOURS'))) {
      let seriesName = '';
      console.log('departmentOrEmployee:', this.departmentOrEmployee);
      const personalNumberElement = document.getElementById('personalNumbersCustomTime') as HTMLInputElement;
      const departmentElement = document.getElementById('departmentsSelectCustomTime') as HTMLSelectElement;
  
      if (this.departmentOrEmployee === await firstValueFrom(this.translate.get('EMPLOYEE'))) {
        const employee: Employee | undefined = await this.dataService.getEmployeeByPersonalNumber(personalNumberElement.value);
        if (employee) {
          seriesName = employee.firstName + ' ' + employee.lastName;
        } else {
          seriesName = 'Employee not found';
        }
      } else if (this.departmentOrEmployee === await firstValueFrom(this.translate.get('DEPARTMENT')) && departmentElement) {
        seriesName = departmentElement.value;
      }
  
      const transformedData = this.customTimeOvertimes.reduce((acc: { name: string, value: number }[], overtime) => {
        console.log('old Date:', overtime.overtimeDay);
        // const date = new Date(overtime.overtimeDay).toDateString().split('T')[0]; // Use toISOString and split to get YYYY-MM-DD
        const date = new Date(overtime.overtimeDay).toLocaleDateString('sk-SK');
        console.log('new Date:', date);
        const existingEntry = acc.find(entry => entry.name === date);
        if (existingEntry) {
          existingEntry.value += overtime.overtimeHours;
        } else {
          acc.push({ name: date, value: overtime.overtimeHours });
        }
        return acc;
      }, []);
  
      this.customTimeOvertimesData = [
        {
          name: seriesName,
          series: transformedData
        }
      ];
      console.log('Transformed custom time overtimes data:', this.customTimeOvertimesData);
    } else if (this.hoursOrType === await firstValueFrom(this.translate.get('OVERTIMES-TYPES-SHARES'))) {
      const overtimeTypes: OvertimeType[] = await this.dataService.getOvertimeTypes();
      const transformedData = this.customTimeOvertimes.reduce((acc: { [key: string]: { name: string, value: number }[] }, overtime) => {
        const date = new Date(overtime.overtimeDay).toISOString().split('T')[0]; // Use toISOString and split to get YYYY-MM-DD
        console.log('Date:', date);
        const typeName = overtimeTypes.find(type => type.overtimeTypeId === overtime.overtimeTypeId)?.typeName || overtime.overtimeTypeId;
        if (!acc[typeName]) {
          acc[typeName] = [];
        }
        const existingEntry = acc[typeName].find(entry => entry.name === date);
        if (existingEntry) {
          existingEntry.value += overtime.overtimeHours;
        } else {
          acc[typeName].push({ name: date, value: overtime.overtimeHours });
        }
        return acc;
      }, {});
  
      this.customTimeOvertimesTypesData = Object.keys(transformedData).map(type => ({
        name: type,
        series: transformedData[type]
      }));
      console.log('Transformed custom time overtimes types data:', this.customTimeOvertimesTypesData);
    }
  }
  
  // async getOvertimeTypes(): Promise<OvertimeType[]>
  // {
  //   return await this.dataService.getOvertimeTypes();
  // }

  async getMaxMonthOvertimes(): Promise<void>
  {
    const selectedYearElement = document.getElementById('selectedYearForMaxMonth') as HTMLInputElement;
    const year = Number(selectedYearElement.value);
    this.maxMonthOvertimes = await this.dataService.getMaxMonthOvertimes(year);
    console.log('Received maxMonthOvertimes total hours:', this.maxMonthOvertimes.totalHours);
    this.cdr.detectChanges();
    // this.transformMaxMonthOvertimesData(maxMonthOvertimes);
  }

  getLegendTitle(data: any[]): string {
    if (data && data.length > 0) {
      return data.map(item => item.name).join(', ');
    }
    return 'Graph Data';
  }

  exportToPDF(title: string, graphId: string, data: any[]): void {
    const doc = new jsPDF();

    doc.addFileToVFS('Roboto_Condensed-Black-normal.ttf', 'Roboto_Condensed-Black-normal');
    doc.addFont('Roboto_Condensed-Black-normal', 'Roboto Condensed', 'normal');
    // doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
    
    doc.text(title, 10, 10);
  
    // Add parameters to the PDF
    const startDateElement = document.getElementById('selectedCustomStartDate') as HTMLInputElement;
    const endDateElement = document.getElementById('selectedCustomEndDate') as HTMLInputElement;
    const startDate = startDateElement ? startDateElement.value : '';
    const endDate = endDateElement ? endDateElement.value : '';
    const statType = this.hoursOrType === this.translate.instant('OVERTIME-HOURS') ? this.translate.instant('OVERTIME-HOURS') : this.hoursOrType;
  
    doc.text(`${this.translate.instant('START-DATE')}: ${startDate}`, 10, 20);
    doc.text(`${this.translate.instant('END-DATE')}: ${endDate}`, 10, 30);
    doc.text(`${this.translate.instant('STAT-TYPE')}: ${statType}`, 10, 40);
  
    // Capture the graph as an image
    const graphElement = document.getElementById(graphId); // Replace with your graph element ID
    if (graphElement) {
      const svgElement = graphElement.querySelector('svg');
      const legendElement = graphElement.querySelector('.chart-legend') as HTMLElement;
      console.log('Legend element:', legendElement);
      if (svgElement) 
      {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
  
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = svgElement.clientWidth * 2;
          canvas.height = svgElement.clientHeight * 2;
          const context = canvas.getContext('2d');
          if (context) {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
  
            const imgData = canvas.toDataURL('image/png', 1.0); // Set image quality to 1.0 (maximum)
            const imgWidth = 190; // Adjust the width as needed
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            doc.addImage(imgData, 'PNG', 10, 50, imgWidth, imgHeight);
  
            // Add table data after the graph
            let startY = 50 + imgHeight + 10;
  
            if (legendElement) {
              html2canvas(legendElement).then((legendCanvas) => {
                const legendImgData = legendCanvas.toDataURL('image/png', 1.0);
                doc.addImage(legendImgData, 'PNG', 10, startY, legendCanvas.width / 4, legendCanvas.height / 4);
                startY += 10 + legendCanvas.height / 4;
  
                if (data.length > 0) {
                  data.forEach((item, index) => {
                      doc.text(item.name, 10, startY + (index * 10));
                      autoTable(doc, {
                          head: [['Date', 'Value']],
                          body: item.series
                            .filter((seriesItem: { name: string, value: number }) => seriesItem.value !== 0)
                            .map((seriesItem: { name: string, value: number }) => [seriesItem.name, seriesItem.value]),
                          startY: startY + 5 + (index * 10)
                      });
                      startY += 10 + (item.series.length * 10); // Adjust startY for the next table
                  });
                }
  
                doc.save(title + '.pdf');
                URL.revokeObjectURL(svgUrl);
              }).catch((error) => {
                console.error('Error capturing legend:', error);
              });
            } else {
              console.error('Legend element not found');
            }
          }
        };
  
        img.src = svgUrl;
      } else {
        console.error('SVG element not found');
      }
    } else {
      console.error('Graph element not found');
    }
  }
  

  // exportToXLSX(title: string, data: any[]): void 
  // {
  //   const worksheetData = data.map(item => ({
  //     Name: item.name,
  //     ...item.series.reduce((acc: any, seriesItem: { name: string, value: number }) => {
  //         acc[seriesItem.name] = seriesItem.value;
  //         return acc;
  //     }, {})
  // }));

  // const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  // const workbook = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  // saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `${title}.xlsx`);  
  // }

  exportToXLSX(title: string, data: any[]): void {
    // Predpokladáme, že `data` obsahuje pole objektov s `name` a `series`
    if (data.length === 0) {
      console.error('No data to export');
      return;
    }
  
    // Predpokladáme, že exportujeme len prvý záznam (meno a jeho nadčasy)
    const firstItem = data[0];

    const startDateElement = document.getElementById('selectedCustomStartDate') as HTMLInputElement;
    const endDateElement = document.getElementById('selectedCustomEndDate') as HTMLInputElement;
    const startDate = startDateElement ? startDateElement.value : '';
    const endDate = endDateElement ? endDateElement.value : '';
    const statType = this.hoursOrType === this.translate.instant('OVERTIME-HOURS') ? this.translate.instant('OVERTIME-HOURS') : this.hoursOrType;
  
    // Pripravte hlavičku tabuľky
    const worksheetData: any[][] = [
      [this.translate.instant('NAME'), `${firstItem.name}`], // Prvý riadok: Meno a meno priezvisko
      [this.translate.instant('STAT-TYPE'), `${statType}`], // Typ štatistiky
      [], // Prázdny riadok
      [this.translate.instant('START-DATE'), `${startDate}`], // Dátum začiatku
      [this.translate.instant('END-DATE'), `${endDate}`], // Dátum konca
      [],
      [this.translate.instant('DATE'), this.translate.instant('OVERTIMES')] // Hlavička pre dátumy a nadčasy
    ];
  
    let sum = 0;

    // Pridajte riadky s dátumami a nadčasmi, kde nadčasy nie sú nulové
    firstItem.series
      .filter((seriesItem: { name: string; value: number }) => seriesItem.value !== 0) // Filtrovanie nulových hodnôt
      .forEach((seriesItem: { name: string; value: number }) => {
        worksheetData.push([seriesItem.name, seriesItem.value]);
        sum += seriesItem.value;
      });

    worksheetData.push([this.translate.instant('SUM'), sum]);
  
    // Vytvorte worksheet a workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
    // Exportujte do XLSX
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `${title}.xlsx`);
  }

  getCurrentDate(): string
  {
    return new Date().toISOString().split('T')[0];
  }

  getCurrentYear(): number
  {
    return new Date().getFullYear();
  }

  getMaxMonthDate(month: number): string
  {
    return Month[month];
  }

  // selectSegmentManager(event: Event): void
  // {
  //   const selectElement = event.target as HTMLSelectElement;
  //   const selectedIndex = selectElement.selectedIndex;
  //   this.selectedSegmentManager = this.segmentManagers[selectedIndex];
  //   console.log('Selected Segment Manager:', this.selectedSegmentManager);
  // }

  selectDepartment(event: Event): void
  {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex - 1;
    this.selectedDepartment = this.departments[selectedIndex];
  }

  selectDepartmentAvg(event: Event): void
  {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex - 1;
    this.selectedDepartmentAvg = this.departments[selectedIndex];
    if (this.selectedDepartmentAvg === undefined)
      this.selectedDepartmentAvg = 'ALL';
    console.log('Selected department:', this.selectedDepartmentAvg);
  }

  async selectStatType(event: Event): Promise<void> {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex;
    this.selectedStatType = await firstValueFrom(this.translate.get(this.statTypes[selectedIndex]));
    console.log('Selected statType:', this.selectedStatType);
  }

  selectDepartmentOrEmployeeCustomTime(event: Event): void
  {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    this.departmentOrEmployee = selectedValue;
    console.log('Selected departmentOrEmployee:', this.departmentOrEmployee);
  }

  selectDepartmentOrEmployeeAvg(event: Event): void
  {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    this.departmentOrEmployeeAvg = selectedValue;
    console.log('Selected departmentOrEmployeeAvg:', this.departmentOrEmployeeAvg);
  }

  selectCustomTimeType(event: Event): void
  {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    this.hoursOrType = selectedValue;
    console.log('Selected hoursOrType:', this.hoursOrType);
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

  toggleMaxMonth(): void
  {
    this.shownMaxMonth = !this.shownMaxMonth;
  }

  toggleOvertimeTypes(): void
  {
    this.shownOvertimeTypes = !this.shownOvertimeTypes;
  }
}
