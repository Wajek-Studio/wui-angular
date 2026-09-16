import { Component, OnDestroy, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { WuiPage, WuiPageRef, WuiPageService } from '@wajek/wui';

@Component({
  selector: 'app-home-page',
  imports: [WuiPage, RouterLink, RouterOutlet],
  template: `
    <ng-template #page>
        <wui-page>
            <h2>Halaman Demo</h2>
            <p>
            Page ini dirender ke overlay <code>WuiApp</code>, bukan di tempat komponen ini berdiri.
            </p>
            <button type="button" routerLink="nested">Open Nested</button>
        </wui-page>
    </ng-template>

    <router-outlet/>
  `,
  styles: `
    .demo-page {
      min-height: 100%;
      padding: 2rem;
      background: #fff;
    }
  `,
})
export class HomePage implements OnInit, OnDestroy {
  private readonly pageService: WuiPageService = inject(WuiPageService);
  pageTpl = viewChild<TemplateRef<any>>('page');

  private ref?: WuiPageRef;

  ngOnInit(): void {
    this.ref = this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }

  ngOnDestroy(): void {
    this.ref?.close();
  }

  protected tutup(): void {
    this.ref?.close();
  }
}
