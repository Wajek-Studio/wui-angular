import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { WuiButton, WuiIcon, WuiPage, WuiPageService, WuiScrollbar, WuiContainer, WuiTable } from '@wajek/wui';
import { firstValueFrom } from 'rxjs';
import { ShowcaseComponent, ShowcaseTab } from '../../../shared/showcase';
import { ButtonSimpleExample } from '../../../../examples/button-simple.example';

export interface ButtonSnippet {
  html?: string;
  ts?: string;
}

@Component({
  selector: 'app-button.page',
  imports: [WuiButton, WuiIcon, WuiPage, ShowcaseComponent, WuiScrollbar, WuiContainer, WuiTable, ShowcaseComponent, ButtonSimpleExample],
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
