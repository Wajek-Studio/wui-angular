import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  EmbeddedViewRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
} from '@angular/core';

import { WuiPageRef } from './page.ref';
import { WuiPageService } from './page.service';

interface WuiPageView {
  readonly view: EmbeddedViewRef<unknown>;
  readonly wrapper: HTMLElement;
  readonly outlet: DomPortalOutlet;
  readonly trap: FocusTrap | null;
  readonly trigger: HTMLElement | null;
}

@Directive({
  selector: '[wuiPageHost]',
  host: { class: 'wui-page--host' },
})
export class WuiPageHost implements OnInit, OnDestroy {

  readonly name = input<string>('main');

  private readonly pages = inject(WuiPageService);
  private readonly container = inject(ViewContainerRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly trapFactory = inject(FocusTrapFactory);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly hostElement = this.element.nativeElement;
  private readonly views: WuiPageView[] = [];

  ngOnInit(): void {
    this.pages.register(this);
  }

  attach(template: TemplateRef<unknown>): WuiPageRef {
    const trigger = this.isBrowser ? (this.document.activeElement as HTMLElement | null) : null;
    const wrapper: HTMLElement = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'wui-page--layer');
    this.renderer.appendChild(this.hostElement, wrapper);

    const outlet = new DomPortalOutlet(wrapper);
    const view = outlet.attachTemplatePortal(new TemplatePortal(template, this.container));
    const trap = this.isBrowser ? this.trapFactory.create(wrapper) : null;

    this.views.push({ view, wrapper, outlet, trap, trigger });
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
    page.outlet.dispose();

    this.syncTraps();

    if (teratas) this.restoreFocus(page);
  }

  detachAll(): void {
    const teratas = this.views.at(-1);

    for (const page of this.views) {
      page.trap?.destroy();
      page.outlet.dispose();
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

