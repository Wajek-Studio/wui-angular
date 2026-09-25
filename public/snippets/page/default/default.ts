import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { WuiPage, WuiPageContent, WuiPageHost, WuiPageService, WuiScrollbar, WuiButton } from '@wajek/wui';

@Component({
  templateUrl: './example.html',
  imports: [WuiPage, WuiPageContent, WuiPageHost, WuiScrollbar, WuiButton],
})
export class ExampleComponent {
  pageService = inject(WuiPageService);
  defaultPageTpl = viewChild.required<TemplateRef<any>>('defaultPageTpl');

  openDefaultPage() {
    // replace() menghapus semua layer lama lalu memasang tpl baru
    this.pageService.replace(this.defaultPageTpl(), 'default-demo');
  }
}
