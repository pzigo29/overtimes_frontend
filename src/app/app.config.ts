import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi, HttpClient, withFetch } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

export function HttpLoaderFactory(http: HttpClient)
{
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: TranslateLoader,
      useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
      deps: [HttpClient]
    },
    importProvidersFrom(TranslateModule.forRoot(
      {
        loader: 
        {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]  
        }
      }
    ))
  ],
};


