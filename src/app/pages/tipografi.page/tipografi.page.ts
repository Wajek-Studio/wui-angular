import { Component, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiBadge, WuiPage, WuiPageContent, WuiPageService, WuiScrollbar } from '@wajek/wui';

@Component({
  selector: 'app-tipografi.page',
  imports: [WuiPage, WuiPageContent, WuiScrollbar, WuiBadge],
  templateUrl: './tipografi.page.html',
  styleUrl: './tipografi.page.scss',
})
export class TipografiPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);
  pageTpl = viewChild<TemplateRef<any>>('page');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }
}
