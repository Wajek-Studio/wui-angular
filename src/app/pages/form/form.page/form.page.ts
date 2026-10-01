import { Component, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import {
  WuiPage,
  WuiPageService,
  WuiScrollbar
} from '@wajek/wui';
import { ShowcaseComponent } from '../../../shared/showcase';
import { FormSimpleExample } from '../../../../examples/form-simple-example/form-simple-example';
import { FormFilledExample } from '../../../../examples/form-filled-example/form-filled-example';

@Component({
  selector: 'app-form.page',
  imports: [
    WuiPage,
    WuiScrollbar,
    ShowcaseComponent,
    FormSimpleExample,
    // FormFilledExample
],
  templateUrl: './form.page.html',
  styleUrl: './form.page.scss',
})
export class FormPage implements OnInit {
  private readonly pageService = inject(WuiPageService);
  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!);
  }
}
