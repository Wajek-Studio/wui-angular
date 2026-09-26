import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { WuiPage, WuiPageContent, WuiPageService, WuiScrollbar, WuiSidenavService, WuiContainer } from '@wajek/wui';
import { AppSimpleExample } from '../../../../examples/app-simple-example/app-simple-example';
import { Code } from '../../../shared/code/code';
import { ShowcaseComponent } from '../../../shared/showcase/showcase.component';

@Component({
  selector: 'app-home.page',
  imports: [WuiPage, WuiPageContent, WuiScrollbar, WuiContainer, Code, ShowcaseComponent, AppSimpleExample],
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
