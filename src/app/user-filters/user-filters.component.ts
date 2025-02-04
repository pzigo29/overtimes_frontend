import { TitleBarComponent } from '../title-bar/title-bar.component';
import { UserFilterService } from '../services/user-filter.service';
import { User } from '../models/data.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, Input, numberAttribute, booleanAttribute } from '@angular/core'; 

@Component({
  selector: 'app-user-filters',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-filters.component.html',
  styleUrl: './user-filters.component.scss'
})
export class UserFiltersComponent {

  managerDemo: User = {
    personUserName: 'lasjra',
    firstName: 'Juraj',
    lastName: 'Laš',
    personalNumber: '312165489',
    costCenter: '0045-1709',
    overtimeMaxLimit: 40,
    overtimeMinLimit: 5,
    realOvertime: 10.46,
    manager: null,
    dSegment: '3'
  }

  users: User[] = [
    {
      personUserName: 'zigopvo',
      firstName: '',
      lastName: '',
      personalNumber: '312165487',
      costCenter: '0045-1709',
      overtimeMaxLimit: 40,
      overtimeMinLimit: 5,
      realOvertime: 10.46,
      manager: this.managerDemo,
      dSegment: this.managerDemo.dSegment
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
      personalNumber: '3012115846',
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
      personalNumber: '3012116445',
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
      personalNumber: '3012116444',
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
      personalNumber: '3012116443',
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

  constructor(private userFilterService: UserFilterService) { }
  
  filter: string = 'all';
  personalNumber: string | null = null;
  manager: User | null = null;
  dSegment: string | null = null;
  username: string | null = null;
  showFilters: boolean = false;

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  resetFilters(): void {
    this.filter = 'all';
    this.personalNumber = null;
    this.manager = null;
    this.dSegment = null;
    this.username = null;
  }

  filterUsers(): User[] {
    let filteredUsers = this.users;

    if (this.filter === 'overtime-off-limit') {
      filteredUsers = this.userFilterService.filterUsersByOvertimeOffLimit(filteredUsers);
    } else if (this.filter === 'overtime-in-limit') {
      filteredUsers = this.userFilterService.filterUsersByOvertimeInLimit(filteredUsers);
    }

    if (this.personalNumber) {
      filteredUsers = this.userFilterService.filterUsersByPersonalNumber(filteredUsers, this.personalNumber);
    }

    if (this.manager) {
      filteredUsers = this.userFilterService.filterUsersByManager(filteredUsers, this.manager);
    }

    if (this.dSegment) {
      filteredUsers = this.userFilterService.filterUsersByDSegment(filteredUsers, this.dSegment);
    }

    if (this.username) {
      filteredUsers = this.userFilterService.filterUsersByUserName(filteredUsers, this.username);
    }

    return filteredUsers;
  }

  isSidebarActive(): boolean {
    return TitleBarComponent.isSidebarActive;
  }

  isSidebarVisible(): boolean {
    return TitleBarComponent.isSidebarVisible;
  }





  



}
