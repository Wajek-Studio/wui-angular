// theme.service.ts
import { Injectable, DOCUMENT, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class WuiThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly state = new BehaviorSubject<ThemePreference>(
    this.readInitial()
  );

  readonly preference$: Observable<ThemePreference> = this.state.asObservable();

  constructor() {
    if (!this.isBrowser) return;
    this.apply(this.state.value);
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.state.value === 'system') this.apply('system');
    });
  }

  set(pref: ThemePreference): void {
    this.state.next(pref);
    if (this.isBrowser) {
      if (pref === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, pref);
      this.apply(pref);
    }
  }

  toggle(): void {
    this.set(this.resolved() === 'dark' ? 'light' : 'dark');
  }

  resolved(): Theme {
    return this.resolve(this.state.value);
  }

  private apply(pref: ThemePreference): void {
    const theme = this.resolve(pref);
    const root = this.doc.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  }

  private resolve(pref: ThemePreference): Theme {
    if (pref === 'light' || pref === 'dark') return pref;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private readInitial(): ThemePreference {
    if (!this.isBrowser) return 'system';
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  }
}