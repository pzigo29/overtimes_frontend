import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  setItem(key: string, value: any): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error saving to localStorage', error);
      }
    }
  }

  getItem(key: string): any {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const item = localStorage.getItem(key);
        try {
          return item ? JSON.parse(item) : null;
        } catch {
          return item;
        }
      } catch (error) {
        console.error('Error reading from localStorage', error);
        return null;
      }
    }
    return null;
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage', error);
      }
    }
  }
}