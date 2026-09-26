import { Component, inject, OnInit, signal } from '@angular/core';
import { WuiApp, WuiButton, WuiIcon, WuiTopbar, WuiSidenavContainer, WuiPageHost, WuiSidenav, WuiSidenavService, WuiSidenavItem, WuiSidenavSubheader, WuiScrollbar, WuiSidenavContainerContent } from '@wajek/wui';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    WuiApp,
    RouterOutlet,
    WuiIcon,
    WuiButton,
    WuiTopbar,
    WuiPageHost,
    WuiSidenav,
    RouterLinkWithHref,
    RouterLinkActive,
    WuiSidenavItem,
    WuiSidenavSubheader,
    WuiSidenavContainer,
    WuiSidenavContainerContent,
    WuiScrollbar,
],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[class.sidenav-show]': 'sidenavShow()'
  }
})
export class App implements OnInit {

  private readonly sidenavService = inject(WuiSidenavService);

  /** Id harus sama dengan `id` pada `<wui-sidenav>` di template. */
  readonly sidenavId = 'app-sidenav';
  sidenavShow = signal(true);

  ngOnInit(): void {
    console.log(this.sidenavShow());
    this.sidenavService.stateChange.subscribe((state) => {
      if(state.id !== this.sidenavId)return;
      this.sidenavShow.set(state.show);
    });
  }

  toggleSidenav() {
    this.sidenavService.toggle(this.sidenavId);
  }

  toggleSidenavMini() {
    this.sidenavService.toggleMini(this.sidenavId);
  }

}
