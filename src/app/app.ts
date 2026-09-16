import { Component, inject } from '@angular/core';
import { WuiApp, WuiSidenav, WuiSidenavService, WuiTopbar } from '@wajek/wui';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [WuiApp, RouterOutlet, WuiSidenav, WuiTopbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  private readonly sidenavService = inject(WuiSidenavService);

  /** Id harus sama dengan `id` pada `<wui-sidenav>` di template. */
  private readonly sidenavId = 'app-sidenav';

  toggleSidenav() {
    this.sidenavService.toggle(this.sidenavId);
  }

}
