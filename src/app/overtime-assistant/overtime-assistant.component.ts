import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { Employee } from "../models/data.model";
import { EmployeeFilterService } from "../services/employee-filter.service";
import { EmployeeFiltersComponent } from "../employee-filters/employee-filters.component";
import { MonthsTableComponent } from "../months-table/months-table.component";
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../services/data.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-overtime-assistant',
  standalone: true,
  imports: [TitleBarComponent, CommonModule, FormsModule, EmployeeFiltersComponent, MonthsTableComponent, TranslateModule],
  templateUrl: './overtime-assistant.component.html',
  styleUrl: './overtime-assistant.component.scss'
})
export class OvertimeAssistantComponent implements OnInit {
  title: string = 'RND';
  loading: boolean = true;
  isTableVisible: boolean = true;
  allEmployees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  employeesRealOvertimes: Map<string, number> = new Map<string, number>();
  employeesMinLimits: Map<string, number> = new Map<string, number>();
  employeesMaxLimits: Map<string, number> = new Map<string, number>();
  assistant?: Employee;
  selectedMonth: Date = new Date();

  constructor(private userFilterService: EmployeeFilterService, private dataService: DataService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadAssistantData();
    this.dataService.selectedMonth$.subscribe(
      async (month: Date) => {
        this.loading = true;
        this.selectedMonth = month;
        if (this.assistant) {
          await this.setData();
        }
        this.loading = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    );
  }

  private loadAssistantData(): void {
    let username = '';
    this.dataService.getAssistantUsername().subscribe(
      (data: string | null) => {
        if (data !== null) {
          username = data;
        }
      },
      (error: any) => {
        console.error('Error fetching assistant username', error);
      },
      async () => {
        if (username !== '') {
          console.log('am i here?');
          this.dataService.getEmployee(username).subscribe(
            async (data: Employee | undefined) => {
              this.assistant = data;
              if (this.assistant === undefined) {
                this.loading = false;
                throw new Error('Employee undefined' + username);
              }
              console.log('assistant: ' + this.assistant.username);
              if (this.assistant.levelRole === 0 || this.assistant.levelRole === 1) {
                this.dataService.getEmployees().subscribe(
                  async (data: Employee[]) => {
                    this.filteredEmployees = data;
                    this.allEmployees = this.filteredEmployees;
                    console.log('team member 0: ', this.filteredEmployees[0]);
                    await this.setData();
                    this.loading = false;  // Set to false when data is fully loaded
                    this.cdr.detectChanges(); // Manually trigger change detection
                  },
                  (error: any) => {
                    this.loading = false;
                    console.error('Error fetching employees', error);
                  }
                );
              } else {
                this.loading = false;
              }
            },
            (error: any) => {
              this.loading = false;
              console.error('Error fetching employee', error);
            }
          );
        } else {
          this.loading = false;
        }
      }
    );
  }

  async setData(): Promise<void> {
    console.log('setdata teraz');
    if (this.assistant == undefined) {
      throw new Error('Assistant undefined');
    }
    if (this.filteredEmployees.length === 0) {
      console.log('No employees to set data for');
      return;
    }

    const promises = this.filteredEmployees.map(async (employee) => {
      const [overtimes, minLimit, maxLimit] = await Promise.all([
        this.dataService.getSumOvertime(employee.employeeId, this.selectedMonth),
        this.dataService.getMinLimit(employee.employeeId, this.selectedMonth),
        this.dataService.getMaxLimit(employee.employeeId, this.selectedMonth)
      ]);
      this.employeesRealOvertimes.set(employee.username, overtimes);
      this.employeesMinLimits.set(employee.username, minLimit);
      this.employeesMaxLimits.set(employee.username, maxLimit);
    });

    await Promise.all(promises);
    this.cdr.detectChanges(); // Manually trigger change detection
  }

  getOvertimeStatus(employee: Employee): string {
    if ((this.employeesRealOvertimes.get(employee.username) || 0) < (this.employeesMinLimits.get(employee.username) || 0)) {
      return 'low-value';
    } else if ((this.employeesRealOvertimes.get(employee.username) || 0) + ((this.employeesMaxLimits.get(employee.username) || 0) * 0.1) > (this.employeesMaxLimits.get(employee.username) || 0)) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }

  selectEmployee(employee: Employee): void {
    // this.selectedEmployee = employee;
    // this.router.navigate(['/employee', employee.username]);
  }

  isSidebarActive(): boolean {
    return TitleBarComponent.isSidebarActive;
  }

  isSidebarVisible(): boolean {
    return TitleBarComponent.isSidebarVisible;
  }

  exportToXLSX(): void {
    try {
      const table = document.getElementById('limits-table') as HTMLTableElement;
      let data: any[] = [];
      for (let row of Array.from(table.rows)) {
        let rowData: any[] = [];
        for (let cell of Array.from(row.cells)) {
          let input = cell.querySelector('input');
          rowData.push(input ? input.value : cell.innerText.trim());
        }
        data.push(rowData);
      }
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, this.selectedMonth instanceof Date ? `${this.selectedMonth.getFullYear()}_${this.selectedMonth.getMonth() + 1}` : 'Sheet1');

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      saveAs(dataBlob, this.selectedMonth instanceof Date ? `overtimes_${this.selectedMonth.getFullYear()}_${this.selectedMonth.getMonth() + 1}.xlsx` : 'overtimes.xlsx');
    } catch (error) {
      console.error('Error exporting data', error);
    }
  }

  onFilteredEmployees(filteredEmployees: Employee[]): void {
    this.filteredEmployees = filteredEmployees;
    // this.recalculateSums();
  }

}
