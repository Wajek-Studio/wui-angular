import { Component, inject, signal } from '@angular/core';
import { WuiApp, WuiIcon, WuiSidenavContainer, WuiSidenav, WuiSidenavItem, WuiSidenavSubheader, WuiScrollbar, WuiPageHost, WuiTopbar, WuiButton, WuiThemeService } from '@wajek/wui';
import { RouterLinkWithHref, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    WuiApp,
    WuiIcon,
    WuiSidenav,
    RouterLinkWithHref,
    RouterLinkActive,
    WuiSidenavItem,
    WuiSidenavSubheader,
    WuiSidenavContainer,
    WuiPageHost,
    RouterOutlet,
    WuiTopbar,
    WuiButton,
    WuiScrollbar
],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  themeService = inject(WuiThemeService);
  currentTheme = signal<'light' | 'dark' | 'system'>('system');

  sidenavShow = signal<boolean>(true);
  sidenavMode = signal<'over' | 'side'>('side');

  constructor() {
    this.themeService.preference$.subscribe(t => {
      this.currentTheme.set(t);
    });
  }

  switchTheme() {
    this.themeService.toggle();
  }

  toggleSidenav() {
    this.sidenavShow.update(show => !show);
  }

  toggleSidenavMode() {
    this.sidenavMode.update(mode => mode == 'over' ? 'side' : 'over');
  }

}
