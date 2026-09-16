import { Component, inject, OnDestroy, OnInit, TemplateRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiPage, WuiPageRef, WuiPageService } from '@wajek/wui';

@Component({
  selector: 'app-nested-page',
  imports: [WuiPage, RouterLink],
  templateUrl: './nested.page.html',
  styleUrl: './nested.page.scss',
})
export class NestedPage implements OnInit, OnDestroy {

  pageService : WuiPageService = inject(WuiPageService);
  pageTpl = viewChild.required<TemplateRef<any>>('page');
  pageRef? : WuiPageRef;

  ngOnInit(): void {
    this.pageRef = this.pageService.push(this.pageTpl());
  }

  ngOnDestroy(): void {
    this.pageRef?.close();
  }
  
}
