import { Component, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import {
  WuiContainer,
  WuiPage,
  WuiPageContent,
  WuiPageService,
  WuiScrollbar,
} from '@wajek/wui';
import { ShowcaseComponent } from '../../shared/showcase';
import { SnackbarBasicExample } from '../../../examples/snackbar-basic-example/snackbar-basic-example';

@Component({
  selector: 'app-snackbar-page',
  standalone: true,
  imports: [
    WuiContainer,
    WuiPage,
    WuiPageContent,
    WuiScrollbar,
    ShowcaseComponent,
    SnackbarBasicExample,
  ],
  templateUrl: './snackbar.page.html',
})
export class SnackbarPage implements OnInit {
  private readonly pageService = inject(WuiPageService);
  readonly pageTpl = viewChild.required<TemplateRef<unknown>>('pageTpl');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl());
  }
}