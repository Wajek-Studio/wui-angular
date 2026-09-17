import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { WuiButton, WuiIcon, WuiPage, WuiPageService, WuiSidenavService, WuiTopbar } from '@wajek/wui';

@Component({
  selector: 'app-home.page',
  imports: [WuiPage, RouterOutlet, RouterLink, WuiTopbar, WuiButton, WuiIcon],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {

  private readonly sidenavService: WuiSidenavService = inject(WuiSidenavService);
  private readonly pageService: WuiPageService = inject(WuiPageService);
  pageTpl = viewChild<TemplateRef<any>>('page');

  /** Id harus sama dengan `id` pada `<wui-sidenav>` di template. */
  private readonly sidenavId = 'home-sidenav';

  toggleSidenav() {
    this.sidenavService.toggle(this.sidenavId);
  }

  toggleSidenavMini() {
    this.sidenavService.toggleMini(this.sidenavId);
  }

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }

}
