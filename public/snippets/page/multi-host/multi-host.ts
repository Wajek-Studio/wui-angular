import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { WuiPage, WuiPageContent, WuiPageHost, WuiPageService, WuiScrollbar, WuiButton } from '@wajek/wui';

@Component({
  templateUrl: './example.html',
  imports: [WuiPage, WuiPageContent, WuiPageHost, WuiScrollbar, WuiButton],
})
export class ExampleComponent {
  pageService = inject(WuiPageService);

  hostATpl = viewChild.required<TemplateRef<any>>('hostATpl');
  hostBTpl = viewChild.required<TemplateRef<any>>('hostBTpl');

  openHostA() {
    // Mengarahkan ke host 'host-a' — host-b tidak terpengaruh
    this.pageService.replace(this.hostATpl(), 'host-a');
  }

  openHostB() {
    // Mengarahkan ke host 'host-b' — host-a tidak terpengaruh
    this.pageService.replace(this.hostBTpl(), 'host-b');
  }
}
