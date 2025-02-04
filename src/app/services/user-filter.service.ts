import { Injectable } from '@angular/core';
import { User } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class UserFilterService {
  filterUsersByManager(users: User[], manager: User): User[] {
    return users.filter(user => user.manager === manager);
  }
  filterUsersByDSegment(users: User[], dSegment: string): User[] {
    return users.filter(user => user.dSegment === dSegment);
  }
  filterUsersByOvertimeOffLimit(users: User[]): User[] {
    return users.filter(user => user.realOvertime < user.overtimeMinLimit || user.realOvertime > user.overtimeMaxLimit);
  }
  filterUsersByOvertimeInLimit(users: User[]): User[] {
    return users.filter(user => user.realOvertime >= user.overtimeMinLimit && user.realOvertime <= user.overtimeMaxLimit);
  }
  filterUsersByPersonalNumber(users: User[], personalNumber: string): User[] {
    return users.filter(user => user.personalNumber.toLowerCase().includes(personalNumber.toLowerCase()));
  }
  filterUsersByUserName(users: User[], userName: string): User[] {
    return users.filter(user => user.personUserName.toLowerCase().includes(userName.toLowerCase()));
  }
  constructor() { }
}
