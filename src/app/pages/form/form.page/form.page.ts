import { Component, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import {
  WuiPage,
  WuiPageContent,
  WuiPageService,
  WuiContainer,
  WuiScrollbar,
  WuiTable,
  WuiFormField,
  WuiInput,
  WuiLabel,
} from '@wajek/wui';
import { ShowcaseComponent } from '../../../shared/showcase/showcase.component';
import { FormSimpleExample } from '../../../../examples/form-simple-example/form-simple-example';
import { FormReactiveFullExample } from '../../../../examples/form-reactive-full-example/form-reactive-full-example';

@Component({
  selector: 'app-form.page',
  imports: [
    WuiPage,
    WuiPageContent,
    WuiContainer,
    WuiScrollbar,
    WuiTable,
    WuiFormField,
    WuiInput,
    WuiLabel,
    ShowcaseComponent,
    FormSimpleExample,
    FormReactiveFullExample,
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
