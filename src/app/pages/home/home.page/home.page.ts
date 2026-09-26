import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { WuiPage, WuiPageContent, WuiPageService, WuiScrollbar, WuiContainer } from '@wajek/wui';
import { ShowcaseComponent } from '../../../shared/showcase';
import { Code } from '../../../shared/code/code';
import { AppSimpleExample } from '../../../../examples/app-simple-example/app-simple-example';

@Component({
  selector: 'app-home.page',
  imports: [WuiPage, WuiPageContent, WuiScrollbar, WuiContainer, ShowcaseComponent, Code, AppSimpleExample],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {

  private readonly pageService: WuiPageService = inject(WuiPageService);
  pageTpl = viewChild<TemplateRef<any>>('page');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!);
  }

}
