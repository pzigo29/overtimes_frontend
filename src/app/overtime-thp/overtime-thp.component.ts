import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TitleBarComponent } from "../title-bar/title-bar.component";

@Component({
  selector: 'app-overtime-thp',
  standalone: true,
  imports: [FormsModule, CommonModule, TitleBarComponent],
  templateUrl: './overtime-thp.component.html',
  styleUrl: './overtime-thp.component.scss'
})
export class OvertimeThpComponent {
  personUserName: string = 'zigopvo';
  personalNumber: string = '31216548';
  costCenter: string = '0045-1709';
  overtimeMaxLimit: number = 40;
  overtimeMinLimit: number = 5;
  realOvertime: number = 10.46;
  hoursToLimit: number | null = null;
  
  isSidebarActive(): boolean {
    return TitleBarComponent.isSidebarActive;
  }

  isSidebarVisible(): boolean {
    return TitleBarComponent.isSidebarVisible;
  }

  getOvertimeStatus(): string {
    if (this.realOvertime < this.overtimeMinLimit) {
      return 'low-value';
    } else if (this.realOvertime + (this.overtimeMaxLimit * 0.1) > this.overtimeMaxLimit) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }


  calculateHoursToLimit(): void {
    this.hoursToLimit = this.overtimeMaxLimit - this.realOvertime;
  }
}
