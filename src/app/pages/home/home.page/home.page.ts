import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { WuiPage, WuiPageService, WuiSidenav } from '@wajek/wui';

@Component({
  selector: 'app-home.page',
  imports: [WuiPage, RouterOutlet, RouterLink, WuiSidenav],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly pageService: WuiPageService = inject(WuiPageService);
  pageTpl = viewChild<TemplateRef<any>>('page');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }

}
