import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { WuiPage, WuiPageContent, WuiPageHost, WuiPageRef, WuiPageService, WuiScrollbar, WuiButton } from '@wajek/wui';

@Component({
  templateUrl: './example.html',
  imports: [WuiPage, WuiPageContent, WuiPageHost, WuiScrollbar, WuiButton],
})
export class ExampleComponent {
  pageService = inject(WuiPageService);

  mainPageTpl = viewChild.required<TemplateRef<any>>('mainPageTpl');
  subPageTpl  = viewChild.required<TemplateRef<any>>('subPageTpl');

  subPageRef: WuiPageRef | null = null;

  openMainPage() {
    // replace() → bersihkan semua layer, pasang halaman utama
    this.pageService.replace(this.mainPageTpl(), 'nested-demo');
  }

  openSubPage() {
    // open() → tumpuk sub-halaman di atas yang sudah ada; simpan ref-nya
    this.subPageRef = this.pageService.open(this.subPageTpl(), 'nested-demo');
  }

  closeSubPage() {
    // close() → tutup hanya layer ini; halaman di bawahnya tetap ada
    this.subPageRef?.close();
  }
}
