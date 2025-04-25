import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DataService } from './services/data.service';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from './services/local-storage.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NgApexchartsModule, TranslateModule, FormsModule, CommonModule],
    providers: [DataService],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  darkMode: boolean = false;
  title = 'overtimes_frontend';
  currentLang: string = 'sk';

  allUsernames: string[] = [];
  newUsername: string = '';

  constructor(private translate: TranslateService, public dataService: DataService, private localStorage: LocalStorageService)
  {
    this.getAllUsernames();
    const username = this.localStorage.getItem('username');
    this.newUsername = username;
    console.log('username: ', username);

    this.translate.addLangs(['en', 'sk', 'de']);
    this.translate.setDefaultLang('en');

    if (typeof localStorage !== 'undefined')
    {
      const savedLang = localStorage.getItem('lang') || this.translate.getBrowserLang();
      this.currentLang = savedLang?.match(/en|sk|de/) ? savedLang : 'sk';
      this.translate.use(savedLang?.match(/en|sk|de/) ? savedLang : 'sk');
    } 
    else 
    {
      const savedLang = this.translate.getBrowserLang();
      this.currentLang = savedLang?.match(/en|sk|de/) ? savedLang : 'sk';
      this.translate.use(savedLang?.match(/en|sk|de/) ? savedLang : 'sk');
    }
  }

  async getAllUsernames(): Promise<void>
  {
    this.allUsernames =  await this.dataService.getAllUsernames();
    // console.log('usernames: ', this.allUsernames);
  }

  changeLanguage(event: Event, lang: string)
  {
    event.preventDefault();
    this.translate.use(lang);
    this.currentLang = lang;
    if (typeof localStorage !== 'undefined')
    {
      localStorage.setItem('lang', lang);
    }
  }

  toggleDarkMode(): void
  {
    this.darkMode = !this.darkMode;
    if (this.darkMode)
    {
      document.body.classList.add('dark-mode');
    }
    else
    {
      document.body.classList.remove('dark-mode');
    }
  }

  showDelegateSite(): void
  {
    alert('Not implemented yet!');
  }

  updateUsername(newUsername: string): void {
    if (newUsername.trim()) {
      this.dataService.setUsername(newUsername.trim());
      // alert('Username updated successfully! ' + this.localStorage.getItem('username'));
      window.location.reload();
    } else {
      alert('Please enter a valid username.');
    }
  }
}
