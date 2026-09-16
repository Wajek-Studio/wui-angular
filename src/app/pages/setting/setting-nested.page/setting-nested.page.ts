import { Component, inject, OnDestroy, OnInit, TemplateRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiPage, WuiPageRef, WuiPageService } from '@wajek/wui';

@Component({
  selector: 'app-setting-nested.page',
  imports: [WuiPage, RouterLink],
  templateUrl: './setting-nested.page.html',
  styleUrl: './setting-nested.page.scss',
})
export class SettingNestedPage implements OnInit, OnDestroy {

  pageService = inject(WuiPageService);
  pageRef?: WuiPageRef;

  page = viewChild.required<TemplateRef<any>>('page');

  ngOnInit(): void {
    this.pageRef = this.pageService.push(this.page());
  }

  ngOnDestroy(): void {
    this.pageRef?.close();
  }

}
