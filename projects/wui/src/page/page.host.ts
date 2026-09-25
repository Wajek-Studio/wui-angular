import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  ElementRef,
  EmbeddedViewRef,
  OnDestroy,
  OnInit,
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

  private readonly hostElement = this.element.nativeElement;
  private readonly views: WuiPageView[] = [];

  ngOnInit(): void {
    this.pages.register(this);
  }

  attach(template: TemplateRef<unknown>): WuiPageRef {
    const wrapper: HTMLElement = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'wui-page--layer');
    this.renderer.appendChild(this.hostElement, wrapper);

    const outlet = new DomPortalOutlet(wrapper);
    const view = outlet.attachTemplatePortal(new TemplatePortal(template, this.container));

    this.views.push({ view, wrapper, outlet });

    return new WuiPageRef(() => this.detach(view));
  }

  detach(view: EmbeddedViewRef<unknown>): void {
    const index = this.views.findIndex((page) => page.view === view);
    if (index === -1) return;

    const [page] = this.views.splice(index, 1);
    page.outlet.dispose();
  }

  detachAll(): void {
    for (const page of this.views) {
      page.outlet.dispose();
    }

    this.views.length = 0;
  }

  ngOnDestroy(): void {
    this.detachAll();

    this.pages.unregister(this);
  }
}

