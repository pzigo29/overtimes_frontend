import { TitleBarComponent } from '../title-bar/title-bar.component';
import { UserFilterService } from '../services/user-filter.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, Input, numberAttribute, booleanAttribute } from '@angular/core'; 
import { TranslateModule } from '@ngx-translate/core';
import { Employee } from '../models/data.model';

@Component({
  selector: 'app-user-filters',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './user-filters.component.html',
  styleUrl: './user-filters.component.scss'
})
export class UserFiltersComponent {

  constructor(private userFilterService: UserFilterService) { }
  
  filter: string = 'all';
  personalNumber: string | null = null;
  manager: Employee | null = null;
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

  // filterUsers(): User[] {
  //   let filteredUsers = this.users;

  //   if (this.filter === 'overtime-off-limit') {
  //     filteredUsers = this.userFilterService.filterUsersByOvertimeOffLimit(filteredUsers);
  //   } else if (this.filter === 'overtime-in-limit') {
  //     filteredUsers = this.userFilterService.filterUsersByOvertimeInLimit(filteredUsers);
  //   }

  //   if (this.personalNumber) {
  //     filteredUsers = this.userFilterService.filterUsersByPersonalNumber(filteredUsers, this.personalNumber);
  //   }

  //   if (this.manager) {
  //     filteredUsers = this.userFilterService.filterUsersByManager(filteredUsers, this.manager);
  //   }

  //   if (this.dSegment) {
  //     filteredUsers = this.userFilterService.filterUsersByDSegment(filteredUsers, this.dSegment);
  //   }

  //   if (this.username) {
  //     filteredUsers = this.userFilterService.filterUsersByUserName(filteredUsers, this.username);
  //   }

  //   return filteredUsers;
  // }

  isSidebarActive(): boolean {
    return TitleBarComponent.isSidebarActive;
  }

  isSidebarVisible(): boolean {
    return TitleBarComponent.isSidebarVisible;
  }





  



}
