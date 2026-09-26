import { Component, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import { WuiBadge, WuiPage, WuiPageContent, WuiPageService, WuiScrollbar, WuiContainer } from '@wajek/wui';

@Component({
  selector: 'app-tipografi.page',
  imports: [WuiPage, WuiPageContent, WuiScrollbar, WuiBadge, WuiContainer],
  templateUrl: './tipografi.page.html',
  styleUrl: './tipografi.page.scss',
})
export class TipografiPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);
  pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl());
  }
}
