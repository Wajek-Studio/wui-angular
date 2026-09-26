import { Component, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { WuiContainer, WuiPage, WuiPageContent, WuiPageService, WuiScrollbar, WuiTable } from '@wajek/wui';
import { ShowcaseComponent } from '../../shared/showcase';
import { SpacingMarginExample } from '../../../examples/spacing-margin-example/spacing-margin-example';
import { SpacingPaddingExample } from '../../../examples/spacing-padding-example/spacing-padding-example';
import { SpacingAutoMarginExample } from '../../../examples/spacing-auto-margin-example/spacing-auto-margin-example';
import { SpacingGapExample } from '../../../examples/spacing-gap-example/spacing-gap-example';

@Component({
  selector: 'app-spacing-page',
  standalone: true,
  imports: [
    WuiContainer,
    WuiPage,
    WuiPageContent,
    WuiScrollbar,
    WuiTable,
    ShowcaseComponent,
    SpacingMarginExample,
    SpacingPaddingExample,
    SpacingAutoMarginExample,
    SpacingGapExample
  ],
  templateUrl: './spacing.page.html'
})
export class SpacingPage implements OnInit {
  private readonly pageService = inject(WuiPageService);
  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!);
  }
}
