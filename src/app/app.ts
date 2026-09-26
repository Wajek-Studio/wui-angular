import { Component } from '@angular/core';
import { WuiApp, WuiButton, WuiIcon, WuiTopbar, WuiSidenavContainer, WuiPageHost, WuiSidenav } from '@wajek/wui';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    WuiApp,
    RouterOutlet,
    WuiIcon,
    WuiButton,
    WuiTopbar,
    WuiSidenavContainer,
    WuiPageHost,
    WuiSidenav,
    RouterLinkWithHref,
    RouterLinkActive
],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  // private readonly sidenavService = inject(WuiSidenavService);

  /** Id harus sama dengan `id` pada `<wui-sidenav>` di template. */
  private readonly sidenavId = 'app-sidenav';

  toggleSidenav() {
    // this.sidenavService.toggle(this.sidenavId);
  }

  toggleSidenavMini() {
    // this.sidenavService.toggleMini(this.sidenavId);
  }

}
