import { Component, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import {
  WuiPage,
  WuiPageService,
  WuiScrollbar
} from '@wajek/wui';
import { ShowcaseComponent } from '../../../shared/showcase';
import { FormReactiveExample } from '../../../../examples/form-reactive-example/form-reactive-example';

@Component({
  selector: 'app-form.page',
  imports: [
    WuiPage,
    WuiScrollbar,
    ShowcaseComponent,
    FormReactiveExample
],
  templateUrl: './form.page.html',
  styleUrl: './form.page.scss',
})
export class FormPage implements OnInit {
  private readonly pageService = inject(WuiPageService);
  readonly pageTpl = viewChild.required<TemplateRef<any>>('page');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl());
  }
}
