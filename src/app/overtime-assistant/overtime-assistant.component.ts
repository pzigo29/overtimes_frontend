import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { User } from "../models/user.model"

@Component({
  selector: 'app-overtime-assistant',
  standalone: true,
  imports: [TitleBarComponent, CommonModule, FormsModule],
  templateUrl: './overtime-assistant.component.html',
  styleUrl: './overtime-assistant.component.scss'
})
export class OvertimeAssistantComponent {
  title: string = 'Nadčasy R&D';

  users: User[] = [
    {
      personUserName: 'zigopvo',
      firstName: '',
      lastName: '',
      personalNumber: '312165481',
      costCenter: '0045-1709',
      overtimeMaxLimit: 40,
      overtimeMinLimit: 5,
      realOvertime: 10.46,
      manager: null,
      dSegment: null
    },
    {
      personUserName: 'roskovld',
      firstName: '',
      lastName: '',
      personalNumber: '12345678',
      costCenter: '0045-1710',
      overtimeMaxLimit: 35,
      overtimeMinLimit: 4,
      realOvertime: 3.18,
      manager: null,
      dSegment: null
    },
    {
      personUserName: 'murcosmu',
      firstName: '',
      lastName: '',
      personalNumber: '3012115842',
      costCenter: '0045-1710',
      overtimeMaxLimit: 10,
      overtimeMinLimit: 0,
      realOvertime: 0.21,
      manager: null,
      dSegment: null
    },
    {
      personUserName: 'pilcmre',
      firstName: '',
      lastName: '',
      personalNumber: '3012116442',
      costCenter: '0045-1710',
      overtimeMaxLimit: 12,
      overtimeMinLimit: 3,
      realOvertime: 1.21,
      manager: null,
      dSegment: null
    },
    {
      personUserName: 'ujofero',
      firstName: '',
      lastName: '',
      personalNumber: '3012116442',
      costCenter: '0045-1710',
      overtimeMaxLimit: 2,
      overtimeMinLimit: 0,
      realOvertime: 1.25,
      manager: null,
      dSegment: null
    },
    {
      personUserName: 'tetajana',
      firstName: '',
      lastName: '',
      personalNumber: '3012116442',
      costCenter: '0045-1710',
      overtimeMaxLimit: 5,
      overtimeMinLimit: 0,
      realOvertime: 4.20,
      manager: null,
      dSegment: null
    },
    {
      personUserName: 'schlzolf',
      firstName: '',
      lastName: '',
      personalNumber: '3012116442',
      costCenter: '0045-1710',
      overtimeMaxLimit: 15,
      overtimeMinLimit: 3,
      realOvertime: 15.5,
      manager: null,
      dSegment: null
    }
  ];

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
