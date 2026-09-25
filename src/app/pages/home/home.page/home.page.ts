import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  WuiPage,
  WuiPageContent,
  WuiPageService,
  WuiScrollbar,
  WuiSidenavService,
  WuiTable,
  WuiTableResponsive,
} from '@wajek/wui';

@Component({
  selector: 'app-home.page',
  imports: [WuiPage, WuiPageContent, WuiScrollbar, RouterOutlet, WuiTable, WuiTableResponsive],
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
    this.pageService.replace(this.pageTpl()!);
  }

}
