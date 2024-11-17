import { Component, HostListener, Inject, PLATFORM_ID, Input } from '@angular/core';
import { OvertimeThpComponent } from '../overtime-thp/overtime-thp.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-title-bar',
  standalone: true,
  imports: [],
  templateUrl: './title-bar.component.html',
  styleUrl: './title-bar.component.scss'
})
export class TitleBarComponent {
  static isSidebarActive: boolean = false;
  static isSidebarVisible: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      TitleBarComponent.isSidebarVisible = window.innerWidth < 430;
    }
  }

  @Input() title: string = 'Nadčasy R&D';

  toggleSidebar(): void {
    TitleBarComponent.isSidebarActive = !TitleBarComponent.isSidebarActive;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      TitleBarComponent.isSidebarVisible = window.innerWidth < 430;
    }
  }
}
