import { Component, effect, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiButton, WuiPage, WuiPageContent, WuiPageService, WuiScrollbar } from '@wajek/wui';
import { ShowcaseComponent } from '../../shared/showcase';
import { FlexDirectionExample } from '../../../examples/flex-direction-example/flex-direction-example';
import { FlexJustifyExample } from '../../../examples/flex-justify-example/flex-justify-example';
import { FlexAlignExample } from '../../../examples/flex-align-example/flex-align-example';
import { FlexFillExample } from '../../../examples/flex-fill-example/flex-fill-example';
import { FlexResponsiveExample } from '../../../examples/flex-responsive-example/flex-responsive-example';

@Component({
  selector: 'app-flex-page',
  standalone: true,
  imports: [
    RouterLink, 
    WuiPage, 
    WuiPageContent, 
    WuiScrollbar, 
    ShowcaseComponent,
    FlexDirectionExample,
    FlexJustifyExample,
    FlexAlignExample,
    FlexFillExample,
    FlexResponsiveExample
  ],
  templateUrl: './flex.page.html'
})
export class FlexPage implements OnInit {
  private readonly pageService = inject(WuiPageService);
  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');
  
  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!);
  }

  
}
