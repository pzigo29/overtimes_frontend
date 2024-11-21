import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { User } from "../models/user.model";


@Component({
  selector: 'app-overtime-mng',
  standalone: true,
  imports: [TitleBarComponent, CommonModule, FormsModule],
  templateUrl: './overtime-mng.component.html',
  styleUrl: './overtime-mng.component.scss'
})
export class OvertimeMngComponent {


  title: string = 'Segment D' + '3';
  // segment: number = 3;

  segmentManager: User = {
    personUserName: 'lasjra',
    personalNumber: '312165481',
    costCenter: '0045-1709',
    overtimeMaxLimit: 200,
    overtimeMinLimit: 50,
    realOvertime: 98.54,
    teamLeader: null,
    segmentManager: null
  };
  
  teamLeaders: User[] = [
    {
      personUserName: 'mrenmchl',
      personalNumber: '312655481',
      costCenter: '0045-1709',
      overtimeMaxLimit: 60,
      overtimeMinLimit: 15,
      realOvertime: 16.54,
      teamLeader: null,
      segmentManager: this.segmentManager
    },
    {
      personUserName: 'zimorvo',
      personalNumber: '12345678',
      costCenter: '0045-1710',
      overtimeMaxLimit: 50,
      overtimeMinLimit: 10,
      realOvertime: 52.20,
      teamLeader: null,
      segmentManager: this.segmentManager
    }
  ];
    
  users: User[] = [
    {
      personUserName: 'zigopvo',
      personalNumber: '312165481',
      costCenter: '0045-1709',
      overtimeMaxLimit: 40,
      overtimeMinLimit: 5,
      realOvertime: 10.46,
      teamLeader: this.teamLeaders.find(tl => tl.personUserName === 'mrenmchl') || null,
      segmentManager: this.segmentManager
    },
    {
      personUserName: 'roskovld',
      personalNumber: '12345678',
      costCenter: '0045-1710',
      overtimeMaxLimit: 35,
      overtimeMinLimit: 4,
      realOvertime: 3.18,
      teamLeader: this.teamLeaders.find(tl => tl.personUserName === 'mrenmchl') || null,
      segmentManager: this.segmentManager
    },
    {
      personUserName: 'murcosmu',
      personalNumber: '3012115842',
      costCenter: '0045-1710',
      overtimeMaxLimit: 10,
      overtimeMinLimit: 0,
      realOvertime: 0.21,
      teamLeader: this.teamLeaders.find(tl => tl.personUserName === 'zimorvo') || null,
      segmentManager: this.segmentManager
    },
    {
      personUserName: 'pilcmre',
      personalNumber: '3012116442',
      costCenter: '0045-1710',
      overtimeMaxLimit: 12,
      overtimeMinLimit: 3,
      realOvertime: 1.21,
      teamLeader: this.teamLeaders.find(tl => tl.personUserName === 'zimorvo') || null,
      segmentManager: this.segmentManager
    }
  ];

  filterTL: User | null = null;

  setFilter(user: User) {
    this.filterTL = user;
  }

  get filteredUsers() {
    return this.users.filter(user => user.teamLeader === this.filterTL)
  }

  onTLButtonClick(user: User) {
    this.setFilter(user);
    this.showForm('THPForm');
    this.title = 'Tím: ' + this.filterTL?.personUserName;
    }

  sumOvertimeMaxLimits(users: User[]): number {
    let sum: number = 0;
    users.forEach(user => {
      sum += user.overtimeMaxLimit;
    });
    return sum;
  }

  sumOvertimeMinLimits(users: User[]): number {
    let sum: number = 0;
    users.forEach(user => {
      sum += user.overtimeMinLimit;
    });
    return sum;
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

  currentForm: string | null = 'segmentForm';

  showForm(form: string) {
    this.currentForm = form;
    this.title = 'Segment D' + '3';  
  }
}
