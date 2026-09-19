import { Component, inject, OnDestroy, OnInit, TemplateRef, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { WuiPage, WuiPageRef, WuiPageService } from '@wajek/wui';

@Component({
  selector: 'app-setting.page',
  imports: [WuiPage, RouterLink, RouterOutlet],
  templateUrl: './setting.page.html',
  styleUrl: './setting.page.scss',
})
export class SettingPage implements OnInit, OnDestroy{

  pageService = inject(WuiPageService);
  pageRef?: WuiPageRef;

  page = viewChild.required<TemplateRef<any>>('page');

  ngOnInit(): void {
    this.pageService.replace(this.page());
  }

  ngOnDestroy(): void {
    this.pageRef?.close();
  }

}
