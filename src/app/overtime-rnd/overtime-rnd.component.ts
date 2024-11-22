import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleBarComponent } from "../title-bar/title-bar.component";
import { User } from "../models/user.model"

@Component({
  selector: 'app-overtime-rnd',
  standalone: true,
  imports: [TitleBarComponent, CommonModule, FormsModule],
  templateUrl: './overtime-rnd.component.html',
  styleUrl: './overtime-rnd.component.scss'
})
export class OvertimeRndComponent {
  title: string = 'Nadčasy R&D';
  isFormOpen: boolean = true;

  rndManager: User = {
    personUserName: 'klimkjn',
    firstName: 'Ján',
    lastName: 'Klimko',
    personalNumber: '312165481',
    costCenter: '0045-1709',
    overtimeMaxLimit: 1000,
    overtimeMinLimit: 0,
    realOvertime: 400.54,
    manager: null,
    dSegment: ''
  }

  segmentManagers: User[] = [{
    personUserName: 'lasjra',
    firstName: 'Juraj',
    lastName: 'Laš',
    personalNumber: '312165481',
    costCenter: '0045-1709',
    overtimeMaxLimit: 200,
    overtimeMinLimit: 50,
    realOvertime: 98.54,
    manager: this.rndManager,
    dSegment: '2'
  },
  {
    personUserName: 'saksojze',
    firstName: 'Jozef',
    lastName: 'Sakson',
    personalNumber: '312165481',
    costCenter: '0045-1709',
    overtimeMaxLimit: 150,
    overtimeMinLimit: 20,
    realOvertime: 162,
    manager: this.rndManager,
    dSegment: '3'
  }
];
  
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
    manager: this.segmentManagers.find(mng => mng.personUserName === 'lasjra') || null,
    dSegment: this.segmentManagers.find(mng => mng.personUserName === 'lasjra')?.dSegment || null
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
    manager: this.segmentManagers.find(mng => mng.personUserName === 'lasjra') || null,
    dSegment: this.segmentManagers.find(mng => mng.personUserName === 'lasjra')?.dSegment || null
  },
  {
    personUserName: 'cimraivn',
    firstName: 'Ivan',
    lastName: 'Cimrák',
    personalNumber: '12345678',
    costCenter: '0045-1710',
    overtimeMaxLimit: 50,
    overtimeMinLimit: 10,
    realOvertime: 52.20,
    manager: this.segmentManagers.find(mng => mng.personUserName === 'saksojze') || null,
    dSegment: this.segmentManagers.find(mng => mng.personUserName === 'saksojze')?.dSegment || null
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
    dSegment: this.teamLeaders.find(tl => tl.personUserName === 'mrenmchl')?.dSegment || null
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
    dSegment: this.teamLeaders.find(tl => tl.personUserName === 'mrenmchl')?.dSegment || null
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
    dSegment: this.teamLeaders.find(tl => tl.personUserName === 'ziakrmn')?.dSegment || null
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
    dSegment: this.teamLeaders.find(tl => tl.personUserName === 'ziakrmn')?.dSegment || null
  }
];

  filterTL: User | null = this.rndManager;

  setFilter(user: User) {
    this.filterTL = user;
  }

  get filteredUsers() {
    return this.users.filter(user => user.manager === this.filterTL)
  }

  onButtonClick(user: User, form: string) {
    this.setFilter(user);
    this.showForm(form);
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

  currentForm: string | null = 'RnDForm';

  showForm(form: string) {
    this.currentForm = form;
    if (this.currentForm == 'RnDForm' || this.currentForm == 'segmentForm') {
      this.title = 'Nadčasy R&D';
    } else {
      this.title = 'Segment D' + this.filterTL?.dSegment;  
    }
    
  }
}
