import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiPage, WuiPageContent, WuiPageRef, WuiPageService, WuiScrollbar } from '@wajek/wui';

@Component({
  selector: 'app-home-nested.page',
  imports: [WuiPage, WuiPageContent, WuiScrollbar, RouterLink],
  templateUrl: './home-nested.page.html',
  styleUrl: './home-nested.page.scss',
})
export class HomeNestedPage {
  
  pageService : WuiPageService = inject(WuiPageService);
  pageTpl = viewChild.required<TemplateRef<any>>('page');
  pageRef? : WuiPageRef;

  ngOnInit(): void {
    this.pageRef = this.pageService.push(this.pageTpl());
  }

  ngOnDestroy(): void {
    this.pageRef?.close();
  }

}
