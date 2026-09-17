import { Component, inject } from '@angular/core';
import {
  WuiApp,
  WuiButton,
  WuiIcon,
  WuiSidenav,
  WuiSidenavDivider,
  WuiSidenavFull,
  WuiSidenavInner,
  WuiSidenavItem,
  WuiSidenavMini,
  WuiSidenavService,
  WuiSidenavSubheader,
  WuiTopbar,
} from '@wajek/wui';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    WuiApp,
    RouterOutlet,
    WuiSidenav,
    WuiSidenavInner,
    WuiSidenavMini,
    WuiSidenavFull,
    WuiSidenavItem,
    WuiSidenavDivider,
    WuiSidenavSubheader,
    WuiTopbar,
    WuiIcon,
    WuiButton,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  private readonly sidenavService = inject(WuiSidenavService);

  /** Id harus sama dengan `id` pada `<wui-sidenav>` di template. */
  private readonly sidenavId = 'app-sidenav';

  toggleSidenav() {
    this.sidenavService.toggle(this.sidenavId);
  }

  toggleSidenavMini() {
    this.sidenavService.toggleMini(this.sidenavId);
  }

}
