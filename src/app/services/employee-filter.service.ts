import { Injectable, OnInit } from '@angular/core';
import { Employee } from '../models/data.model';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeFilterService {

  filterEmployeesByManager(employees: Employee[], manager: Employee): Employee[] {
    return employees.filter(employee => employee.managerId === manager.employeeId);
  }
  // filterUsersByDSegment(users: Employee[], dSegment: string): Employee[] {
  //   return users.filter(user => user.dSegment === dSegment);
  // }
  filterEmployeesByOvertimeOffLimit(minLimits: Map<string, number>, maxLimits: Map<string, number>, realOvertimes: Map<string, number>, employees: Employee[]): Employee[] 
  {
    return employees.filter(employee => {
      let minLimit = minLimits.get(employee.username) || 0;
      let maxLimit = maxLimits.get(employee.username) || 0;
      let realOvertime = realOvertimes.get(employee.username) || 0;
      return realOvertime < minLimit || realOvertime > maxLimit;
    });
    // return employees.filter(employee => employees. < limit.overtimeMinLimit || limit.realOvertime > limit.overtimeMaxLimit);
  }
  filterEmployeesByOvertimeInLimit(minLimits: Map<string, number>, maxLimits: Map<string, number>, realOvertimes: Map<string, number>, employees: Employee[]): Employee[] 
  {
    return employees.filter(employee => {
      let minLimit = minLimits.get(employee.username) || 0;
      let maxLimit = maxLimits.get(employee.username) || 0;
      let realOvertime = realOvertimes.get(employee.username) || 0;
      return realOvertime >= minLimit && realOvertime <= maxLimit;
    });
    // return users.filter(user => user.realOvertime >= user.overtimeMinLimit && user.realOvertime <= user.overtimeMaxLimit);
  }
  filterEmployeesByPersonalNumber(employees: Employee[], personalNumber: string): Employee[] {
    return employees.filter(employee => employee.personalNumber.toLowerCase().includes(personalNumber.toLowerCase()));
  }
  filterEmployeesByUserName(employees: Employee[], username: string): Employee[] {
    return employees.filter(employee => employee.username.toLowerCase().includes(username.toLowerCase()));
  }

  filterBySegment(employees: Employee[], segment: string): Employee[]
  {
    return employees.filter(employee => employee.department.toLowerCase().includes(segment.toLowerCase()));
  }

  filterByLastName(employees: Employee[], lastName: string): Employee[]
  {
    return employees.filter(employee => employee.lastName.toLowerCase().includes(lastName.toLowerCase()));
  }

  filterByFirstName(employees: Employee[], firstName: string): Employee[]
  {
    return employees.filter(employee => employee.firstName.toLowerCase().includes(firstName.toLowerCase()));
  }
}
