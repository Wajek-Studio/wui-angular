import { Component, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import { WuiContainer, WuiPage, WuiPageContent, WuiPageService, WuiScrollbar, WuiTable } from '@wajek/wui';
import { ShowcaseComponent } from '../../../shared/showcase/showcase.component';

import { GridContainerExample } from '../../../../examples/grid-container-example/grid-container-example';
import { GridBasicExample } from '../../../../examples/grid-basic-example/grid-basic-example';
import { GridResponsiveExample } from '../../../../examples/grid-responsive-example/grid-responsive-example';
import { GridGapExample } from '../../../../examples/grid-gap-example/grid-gap-example';

@Component({
  selector: 'app-grid.page',
  imports: [
    WuiContainer,
    WuiPage,
    WuiPageContent,
    WuiScrollbar,
    WuiTable,
    ShowcaseComponent,
    GridContainerExample,
    GridBasicExample,
    GridResponsiveExample,
    GridGapExample
  ],
  templateUrl: './grid.page.html',
})
export class GridPage implements OnInit {
  private readonly pageService = inject(WuiPageService);
  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!);
  }
}
