import { Component, inject } from '@angular/core';
import { WuiApp, WuiButton, WuiIcon, WuiSidenav, WuiSidenavBody, WuiSidenavFooter, WuiSidenavFull, WuiSidenavItem, WuiSidenavMini, WuiSidenavService, WuiSidenavSubheader, WuiTopbar, WuiTopbarLeading, WuiTopbarContent, WuiTopbarTrailing, WuiScrollbar, WuiSidenavContainer, WuiSidenavContainerContent, WuiPageHost } from '@wajek/wui';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    WuiApp,
    RouterOutlet,
    WuiSidenav,
    WuiSidenavBody,
    WuiSidenavFooter,
    WuiSidenavMini,
    WuiSidenavFull,
    WuiSidenavItem,
    WuiSidenavSubheader,
    WuiIcon,
    WuiButton,
    RouterLink,
    RouterLinkActive,
    WuiTopbar,
    WuiTopbarLeading,
    WuiTopbarContent,
    WuiTopbarTrailing,
    WuiScrollbar,
    WuiSidenavContainer,
    WuiSidenavContainerContent,
    WuiPageHost
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
