import { FocusTrap, FocusTrapFactory } from "@angular/cdk/a11y";
import { isPlatformBrowser } from "@angular/common";
import { afterNextRender, AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, Injector, OnDestroy, PLATFORM_ID, runInInjectionContext, TemplateRef, viewChild, ViewContainerRef } from "@angular/core";

@Component({
    selector: 'wui-dialog',
    template: `<ng-container #slot />`,
    host: {
        class: 'wui-dialog'
    }
})
export class WuiDialog implements OnDestroy {

    private readonly elementRef = inject(ElementRef);
    private readonly focusTrapFactory = inject(FocusTrapFactory);
    private readonly injector = inject(Injector); 
    private focusTrap: FocusTrap | null = null;

    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly slot = viewChild.required('slot', { read: ViewContainerRef });
    private readonly platformId = inject(PLATFORM_ID);

    attachTemplate(template: TemplateRef<unknown>) {
        this.slot().clear();
        this.slot().createEmbeddedView(template);
        this.changeDetectorRef.detectChanges();

        if (!isPlatformBrowser(this.platformId)) return;

        this.focusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement);

        runInInjectionContext(this.injector, () => {
            afterNextRender(() => {
                this.focusTrap?.focusInitialElement();
            });
        })
    }

    ngOnDestroy() {
        this.focusTrap?.destroy();
    }

}