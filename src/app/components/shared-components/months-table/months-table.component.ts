import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-months-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './months-table.component.html',
  styleUrl: './months-table.component.scss'
})
export class MonthsTableComponent implements OnInit {
  months: Date[] = [];
  selectedMonth: Date = new Date();
  //displayedMonths: Date[] = [];
  //arePrevious: boolean = false;
  //areNext: boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getMonths().subscribe(
      (data: Date[]) => {
        this.months = data;
        this.updateDisplayedMonths();
      },
      (error) => {
        console.error('Error fetching months', error);
      }
    );
    this.dataService.selectedMonth$.subscribe(
      (data: Date) => {
        this.selectedMonth = data;
      },
      (error: any) => {
        console.error('Error fetching selected month', error);
      }
    );
  }

  currentIndex: number = 0;  // Start index
  itemsPerPage: number = 5;  // How many items to display at once

  // Initialize the displayed months
  displayedMonths: Date[] = this.months.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);

  // Determine if the buttons should be displayed
  arePrevious: boolean = false;
  areNext: boolean = this.currentIndex + this.itemsPerPage < this.months.length;

  loadPreviousElements(): void {
    // Decrement the currentIndex by itemsPerPage
    this.currentIndex = Math.max(this.currentIndex - this.itemsPerPage, 0);
    // Update the displayed months
    this.updateDisplayedMonths();
  }

  loadNextElements(): void {
    // Increment the currentIndex by itemsPerPage
    this.currentIndex = Math.min(this.currentIndex + this.itemsPerPage, this.months.length - 1);
    // Update the displayed months
    this.updateDisplayedMonths();
  }

  private updateDisplayedMonths(): void {
    // Calculate the new end index and update displayedMonths
    const endIndex = Math.min(this.currentIndex + this.itemsPerPage, this.months.length);
    this.displayedMonths = this.months.slice(this.currentIndex, endIndex);
    
    // Update button visibility
    this.arePrevious = this.currentIndex > 0;
    this.areNext = endIndex < this.months.length; // Check if we have more items to display
  }

  selectMonth(month: Date): void
  {
    // console.log(month);
    this.dataService.setSelectedMonth(month);
    this.selectedMonth = month;
  }

  compareYearAndMonth(date1: Date | string, date2: Date | string): boolean
  {
    const parsedDate1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const parsedDate2 = typeof date2 === 'string' ? new Date(date2) : date2;

    if (!(parsedDate1 instanceof Date) || !(parsedDate2 instanceof Date)) 
    {
      console.error('One of the inputs is not a valid Date object');
      return false; // Handle appropriately
    }

    const year1 = parsedDate1.getFullYear();
    const month1 = parsedDate1.getMonth();
    const year2 = parsedDate2.getFullYear();
    const month2 = parsedDate2.getMonth();
    //console.log((year1 === year2 && month1 === month2));
    return year1 === year2 && month1 === month2;
  }

  isSelected(month: Date): boolean
  {
    // if (this.selectedMonth == month)
    //   console.log(month);
    return this.compareYearAndMonth(this.selectedMonth, month);
  }
}
