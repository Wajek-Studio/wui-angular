import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ComponentRef,
  EmbeddedViewRef,
  Injector,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  viewChild,
} from '@angular/core';

import { WuiPageLayer } from './page.layer';
import { WuiPageRef } from './page.ref';
import { WuiPageService } from './page.service';

interface WuiPageView {
  readonly view: EmbeddedViewRef<unknown>;
  readonly layer: ComponentRef<WuiPageLayer>;
  readonly wrapper: HTMLElement;
  readonly trap: FocusTrap | null;
  readonly trigger: HTMLElement | null;
}

/**
 * Wadah tumpukan page.
 *
 * Isi elemen diproyeksikan lewat `<ng-content/>`, dan tiap page dipasang ke container
 * `.wui-page--layers` di template ini supaya `.wui-page--layer` berada di dalam `.wui-page--host`.
 * (Kalau container diambil dari elemen host, layer akan disisipkan sebagai **saudara** host.)
 */
@Component({
  selector: 'wui-page-host',
  host: { class: 'wui-page--host' },
  template: `
    <ng-content/>
    <div class="wui-page--layers" #layers></div>
  `,
})
export class WuiPageHost implements OnInit, OnDestroy {

  readonly name = input<string>('main');

  private readonly pages = inject(WuiPageService);
  private readonly injector = inject(Injector);
  private readonly trapFactory = inject(FocusTrapFactory);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly views: WuiPageView[] = [];
  private readonly layers = viewChild('layers', { read: ViewContainerRef });

  ngOnInit(): void {
    this.pages.register(this);
  }

  attach(template: TemplateRef<unknown>): WuiPageRef {
    const layers = this.layers();

    if (!layers) {
      throw new Error('[wui] Container tumpukan page belum siap.');
    }

    const trigger = this.isBrowser ? (this.document.activeElement as HTMLElement | null) : null;

    // Layer dibuat sebagai komponen supaya container untuk template page hidup DI DALAM
    // pembungkusnya, bukan di container elemen host lalu dipindah. Pemindahan node view ke parent
    // lain membuat hidrasi SSR gagal: Angular mencocokkan container dengan dehydrated view-nya
    // lewat `nextSibling` pada posisi container, sehingga tidak menemukan node yang diharapkan.

    const layer = layers.createComponent(WuiPageLayer);
    const wrapper: HTMLElement = layer.location.nativeElement;

    // Injector elemen host dipakai sebagai parent injector view — sama dengan yang dipakai
    // container host sebelumnya, supaya DI di dalam template page tetap mencari ke rantai host.
    const view = layer.instance.slot().createEmbeddedView(template, undefined, {
      injector: this.injector,
    });

    const trap = this.isBrowser ? this.trapFactory.create(wrapper) : null;

    this.views.push({ view, layer, wrapper, trap, trigger });
    this.syncTraps();

    void trap?.focusInitialElementWhenReady();

    return new WuiPageRef(() => this.detach(view));
  }

  detach(view: EmbeddedViewRef<unknown>): void {
    const index = this.views.findIndex((page) => page.view === view);
    if (index === -1) return;

    const teratas = index === this.views.length - 1;
    const [page] = this.views.splice(index, 1);

    page.trap?.destroy();
    // `destroy()` komponen layer memusnahkan embedded view di dalamnya sekaligus mencabut
    // `.wui-page--layer` dari DOM.
    page.layer.destroy();

    this.syncTraps();

    if (teratas) this.restoreFocus(page);
  }

  detachAll(): void {
    const teratas = this.views.at(-1);

    for (const page of this.views) {
      page.trap?.destroy();
      page.layer.destroy();
    }

    this.views.length = 0;

    if (teratas) this.restoreFocus(teratas);
  }

  ngOnDestroy(): void {
    this.detachAll();

    this.pages.unregister(this);
  }

  private syncTraps(): void {
    const teratas = this.views.length - 1;

    this.views.forEach((page, posisi) => {
      if (page.trap) page.trap.enabled = posisi === teratas;
    });
  }

  private restoreFocus(page: WuiPageView): void {
    const trigger = page.trigger;
    const active = this.document.activeElement as HTMLElement | null;
    if (!trigger?.isConnected) return;

    const fokusDiPage = page.wrapper.contains(active);
    const fokusTidakAda = !active || active === this.document.body;
    if (!fokusDiPage && !fokusTidakAda) return;
    if (trigger.closest('[aria-hidden="true"]')) return;

    trigger.focus();
  }
}

