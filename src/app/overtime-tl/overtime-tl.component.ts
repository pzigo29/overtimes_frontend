import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from '../title-bar/title-bar.component';
import { User } from '../models/user.model';

@Component({
  selector: 'app-overtime-tl',
  standalone: true,
  imports: [CommonModule, TitleBarComponent, FormsModule],
  templateUrl: './overtime-tl.component.html',
  styleUrl: './overtime-tl.component.scss'
})
export class OvertimeTLComponent {
  users: User[] = [
    {
      personUserName: 'zigopvo',
      personalNumber: '312165481',
      costCenter: '0045-1709',
      overtimeMaxLimit: 40,
      overtimeMinLimit: 5,
      realOvertime: 10.46
    },
    {
      personUserName: 'roskovld',
      personalNumber: '12345678',
      costCenter: '0045-1710',
      overtimeMaxLimit: 35,
      overtimeMinLimit: 4,
      realOvertime: 3.18
    },
    {
      personUserName: 'murcosmu',
      personalNumber: '3012115842',
      costCenter: '0045-1710',
      overtimeMaxLimit: 10,
      overtimeMinLimit: 0,
      realOvertime: 0.21
    },
    {
      personUserName: 'pilcmre',
      personalNumber: '3012116442',
      costCenter: '0045-1710',
      overtimeMaxLimit: 12,
      overtimeMinLimit: 3,
      realOvertime: 1.21
    }
  ];
  
  title: string = 'Môj tím';

  isSidebarActive(): boolean {
    return TitleBarComponent.isSidebarActive;
  }

  isSidebarVisible(): boolean {
    return TitleBarComponent.isSidebarVisible;
  }

  getOvertimeStatus(user: User): string {
    if (user.realOvertime < user.overtimeMinLimit) {
      return 'low-value';
    } else if (user.realOvertime + (user.overtimeMaxLimit * 0.1) > user.overtimeMaxLimit) {
      return 'high-value';
    } else {
      return 'medium-value';
    }
  }
}
