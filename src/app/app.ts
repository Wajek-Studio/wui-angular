import { Component, signal } from '@angular/core';
import { WuiApp, WuiIcon, WuiSidenavContainer, WuiSidenav, WuiSidenavItem, WuiSidenavSubheader, WuiScrollbar, WuiPageHost, WuiTopbar, WuiButton } from '@wajek/wui';
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

  sidenavShow = signal<boolean>(true);
  sidenavMode = signal<'over' | 'side'>('side');

  toggleSidenav() {
    this.sidenavShow.update(show => !show);
  }

  toggleSidenavMode() {
    this.sidenavMode.update(mode => mode == 'over' ? 'side' : 'over');
  }

}
