import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NgApexchartsModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  darkMode: boolean = false;
  title = 'overtimes_frontend';
  currentLang: string = 'sk';
  constructor(private translate: TranslateService)
  {
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

  // changeLanguage(event: Event)
  // {
  //   const lang = (event.target as HTMLSelectElement).value;
  //   this.translate.use(lang);
  //   this.currentLang = lang;
  //   if (typeof localStorage !== 'undefined')
  //   {
  //     localStorage.setItem('lang', lang);
  //   }
  // }

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
}
