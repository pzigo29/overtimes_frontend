import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
//import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overtime-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './overtime-page.component.html',
  styleUrl: './overtime-page.component.scss'
})
export class OvertimePageComponent {
  personUserName: string = 'zigopvo';
  personalNumber: string = '31216548';
  costCenter: string = '0045-1709';
  overtimeMaxLimit: number = 40;
  overtimeMinLimit: number = 10;
  realOvertime: number = 5.46;
  hoursToLimit: number | null = null;
  
  calculateHoursToLimit(): void {
    this.hoursToLimit = this.overtimeMaxLimit - this.realOvertime;
  }

  getOvertimeStatus(): string {
    if (this.realOvertime < this.overtimeMinLimit) {
      return 'low-value';
    } else if (this.realOvertime - (this.overtimeMaxLimit * 0.1) > this.overtimeMaxLimit) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }
}
