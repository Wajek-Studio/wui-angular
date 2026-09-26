import { Component, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import { WuiBadge, WuiPage, WuiPageService, WuiScrollbar } from '@wajek/wui';

@Component({
  selector: 'app-tipografi.page',
  imports: [WuiPage, WuiScrollbar, WuiBadge],
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
