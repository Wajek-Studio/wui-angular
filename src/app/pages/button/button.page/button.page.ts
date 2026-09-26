import { Component, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { WuiButton, WuiIcon, WuiPage, WuiPageService, WuiScrollbar, WuiTable } from '@wajek/wui';
import { ShowcaseComponent } from '../../../shared/showcase';
import { ButtonSimpleExample } from '../../../../examples/button-simple.example';

export interface ButtonSnippet {
  html?: string;
  ts?: string;
}

@Component({
  selector: 'app-button.page',
  imports: [WuiButton, WuiIcon, WuiPage, ShowcaseComponent, WuiScrollbar, WuiTable, ShowcaseComponent, ButtonSimpleExample],
  templateUrl: './button.page.html',
  styleUrl: './button.page.scss',
})
export class ButtonPage implements OnInit {

  pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');
  pageService = inject(WuiPageService);

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl());
  }
}
