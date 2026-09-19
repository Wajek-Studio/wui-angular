import { Component, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiButton, WuiIcon, WuiPage, WuiPageService } from '@wajek/wui';

@Component({
  selector: 'app-button.page',
  imports: [RouterLink, WuiButton, WuiIcon, WuiPage],
  templateUrl: './button.page.html',
  styleUrl: './button.page.scss',
})
export class ButtonPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);
  pageTpl = viewChild<TemplateRef<any>>('page');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }
}
