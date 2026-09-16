import {
  AfterViewInit,
  Component,
  OnDestroy,
  ViewContainerRef,
  inject,
  viewChild,
} from '@angular/core';

import { WuiPageService } from '../page/page.service';

/**
 * Shell aplikasi `@wajek/wui`.
 *
 * Dipakai SEKALI di root setiap aplikasi. Tugasnya hanya menyediakan overlay tempat
 * `WuiPageService` menumpuk page — tidak ada logika alur di sini.
 */
@Component({
  selector: 'wui-app',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class WuiApp implements AfterViewInit, OnDestroy {
  private readonly pages = inject(WuiPageService);
  private readonly overlayHost = viewChild.required('overlayHost', { read: ViewContainerRef });

  ngAfterViewInit(): void {
    this.pages.attachHost(this.overlayHost());
  }

  ngOnDestroy(): void {
    this.pages.detachHost();
  }
}
