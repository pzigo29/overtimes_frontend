import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { User } from "../models/data.model";
import { UserFiltersComponent } from "../user-filters/user-filters.component";
import { UserFilterService } from '../services/user-filter.service';


@Component({
  selector: 'app-overtime-mng',
  standalone: true,
  imports: [TitleBarComponent, CommonModule, FormsModule, UserFiltersComponent],
  templateUrl: './overtime-mng.component.html',
  styleUrl: './overtime-mng.component.scss'
})
export class OvertimeMngComponent {


  title: string = 'Segment D' + '3';
  // segment: number = 3;

  segmentManager: User = {
    personUserName: 'lasjra',
    firstName: 'Juraj',
    lastName: 'Laš',
    personalNumber: '312165481',
    costCenter: '0045-1709',
    overtimeMaxLimit: 200,
    overtimeMinLimit: 50,
    realOvertime: 98.54,
    manager: null,
    dSegment: '2'
  };
  
  teamLeaders: User[] = [
    {
      personUserName: 'mrenmchl',
      firstName: 'Michal',
      lastName: 'Mrena',
      personalNumber: '312655481',
      costCenter: '0045-1709',
      overtimeMaxLimit: 60,
      overtimeMinLimit: 15,
      realOvertime: 16.54,
      manager: this.segmentManager,
      dSegment: this.segmentManager.dSegment
    },
    {
      personUserName: 'ziakrmn',
      firstName: 'Roman',
      lastName: 'Žiak',
      personalNumber: '12345678',
      costCenter: '0045-1710',
      overtimeMaxLimit: 50,
      overtimeMinLimit: 10,
      realOvertime: 52.20,
      manager: this.segmentManager,
      dSegment: this.segmentManager.dSegment
    }
  ];
    
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
      manager: this.teamLeaders.find(tl => tl.personUserName === 'mrenmchl') || null,
      dSegment: this.segmentManager.dSegment
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
      manager: this.teamLeaders.find(tl => tl.personUserName === 'mrenmchl') || null,
      dSegment: this.segmentManager.dSegment
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
      manager: this.teamLeaders.find(tl => tl.personUserName === 'ziakrmn') || null,
      dSegment: this.segmentManager.dSegment
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
      manager: this.teamLeaders.find(tl => tl.personUserName === 'ziakrmn') || null,
      dSegment: this.segmentManager.dSegment
    }
  ];

  filterTL: User | null = null;

  setFilter(user: User) {
    this.filterTL = user;
  }

  get filteredUsers() {
    return this.users.filter(user => user.manager === this.filterTL)
  }

  onTLButtonClick(user: User) {
    this.setFilter(user);
    this.showForm('THPForm');
    // this.title = 'Tím: ' + this.filterTL?.personUserName;
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
