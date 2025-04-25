import { Component, OnInit, ViewChild } from '@angular/core';
import { TitleBarComponent } from "../../shared-components/title-bar/title-bar.component";
import { Employee, OvertimeLimitRequest } from '../../../models/data.model';
import { DataService } from '../../../services/data.service';
import { Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { MonthsTableComponent } from "../../shared-components/months-table/months-table.component";
import { TranslateModule } from '@ngx-translate/core';
import { DraggableModalComponent } from '../../draggable-modal/draggable-modal.component';
import { ActivatedRoute } from '@angular/router';
import { min } from 'date-fns';

@Component({
    selector: 'app-overtime-tl-team-detail',
    standalone: true,
    imports: [FormsModule, CommonModule, TranslateModule, TitleBarComponent, DraggableModalComponent, MonthsTableComponent],
    templateUrl: './overtime-tl-team-detail.component.html',
    styleUrl: './overtime-tl-team-detail.component.scss'
})
export class OvertimeTLTeamDetailComponent implements OnInit {
  @ViewChild('myModal') modal!: DraggableModalComponent;

  modalReady: boolean = false;

  title: string = 'TL-TEAM-DETAIL';
  selectedEmployee?: Employee;
  minLimit: number = 0;
  maxLimit: number = 0;
  realOvertime: number = 0;
  reason: string = '';
  approved: boolean = false;
  selectedMonth: Date = new Date();

  requestCount: number = 0;
  requests: OvertimeLimitRequest[] = [];

  constructor(private dataService: DataService, private router: Router, private location: Location, private route: ActivatedRoute) {}

  ngAfterViewInit(): void 
  {
    this.modalReady = true;
    console.log('Modal ready:', this.modal);
  }

  ngOnInit(): void {
    if (typeof sessionStorage !== 'undefined') 
    {
      const savedEmployee = sessionStorage.getItem('selectedEmployee');
      if (savedEmployee) {
        this.selectedEmployee = JSON.parse(savedEmployee);
        console.log('Loaded employee from session storage:', this.selectedEmployee);
        this.setData();
      }
    }
    else 
    {
      console.warn('Session storage is not available');
    }

    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'showChangeRequests') {
        this.showChangeRequests();
      }
    });

    this.dataService.getSelectedEmployee().subscribe(
      (data: Employee | undefined) => {
        this.selectedEmployee = data;
        if (data) {
          sessionStorage.setItem('selectedEmployee', JSON.stringify(data));
          console.log('Saved employee to local storage:', data);
          this.setData();
        } else {
          console.log('No employee data received');
        }
      },
      (error: any) => {
        console.error('Error fetching employee', error);
      }
    );

    this.dataService.selectedMonth$.subscribe(
      (data: Date) => {
        this.selectedMonth = data;
        if (this.selectedEmployee) {
          this.setData();
        } else {
          console.log('No selected employee to set data for');
        }
      }
    );
  }

  isPastMonth(month: Date): boolean
  {
    // console.log('am i here??')
    return this.dataService.isPastMonth(month);
  }

  selectEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    if (typeof sessionStorage !== 'undefined')
    {
      sessionStorage.setItem('selectedEmployee', JSON.stringify(employee));
    }
    else
    {
      console.warn('Session storage is not available');
    }
    console.log('Selected employee:', employee);
    this.setData();
  }

  async setData()
  {
    if (!this.selectedEmployee) {
      console.error('Employee is undefined');
      return;
    }
    console.log('Setting data for employee:', this.selectedEmployee);
    this.minLimit = await this.dataService.getMinLimit(this.selectedEmployee.employeeId, this.selectedMonth);
    this.maxLimit = await this.dataService.getMaxLimit(this.selectedEmployee.employeeId, this.selectedMonth);
    this.realOvertime = await this.dataService.getSumOvertime(this.selectedEmployee.employeeId, this.selectedMonth);
    this.requestCount = await this.dataService.getRequestCount(this.selectedEmployee.employeeId, this.selectedMonth);
    this.requests = await this.dataService.getRequests(this.selectedEmployee.employeeId, this.selectedMonth);
    this.reason = await this.dataService.getLimitReason(this.selectedEmployee.employeeId, this.selectedMonth);
    this.approved = await this.dataService.getApprovedStatus(this.selectedEmployee.employeeId, this.selectedMonth);
  }

  setLimits(minLimit: number, maxLimit: number)
  {
    this.minLimit = minLimit;
    this.maxLimit = maxLimit;
    this.saveLimits();
  }

  async saveLimits(): Promise<void>
  {
    await this.dataService.setLimit(this.selectedEmployee?.employeeId || 0, this.selectedMonth, this.minLimit, this.maxLimit);
  }

  showChangeRequests(): void {
    this.openModal();
  }

  openModal(): void {
    console.log('Opening modal', this.modal);
    if (this.modalReady && this.modal) {
      this.modal.open();
    } else {
      // Alternatívne riešenie - skúsiť znova po krátkom čase
      setTimeout(() => {
        if (this.modal) {
          this.modal.open();
        } else {
          console.error('Modal is still not defined after timeout');
        }
      }, 100);
    }
  }

  closeModal(): void {
    this.modal.close();
  }

  getOvertimeStatus(employee: Employee): string {
    if (this.realOvertime < this.minLimit) {
      return 'low-value';
    } else if (this.realOvertime + (this.maxLimit * 0.1) > this.maxLimit) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }

  showSite(site: string): void {
    this.router.navigate([`${site}`]);
  }

  goBack(): void
  {
    this.location.back();
  }
}
