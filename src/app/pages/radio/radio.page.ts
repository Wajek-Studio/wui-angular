import { Component, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import {
  WuiContainer,
  WuiPage,
  WuiPageContent,
  WuiPageService,
  WuiScrollbar,
} from '@wajek/wui';
import { ShowcaseComponent } from '../../shared/showcase';

import { RadioBasicExample } from '../../../examples/radio-basic-example/radio-basic-example';
import { RadioDisabledExample } from '../../../examples/radio-disabled-example/radio-disabled-example';

@Component({
  selector: 'app-radio-page',
  standalone: true,
  imports: [
    WuiContainer,
    WuiPage,
    WuiPageContent,
    WuiScrollbar,
    ShowcaseComponent,
    RadioBasicExample,
    RadioDisabledExample,
  ],
  templateUrl: './radio.page.html',
})
export class RadioPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);
  readonly pageTpl = viewChild.required<TemplateRef<unknown>>('pageTpl');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl());
  }
}