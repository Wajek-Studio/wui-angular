import { ConnectedPosition, Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { Directive, ElementRef, inject, input, TemplateRef, ViewContainerRef } from "@angular/core";

@Directive({
    selector: '[wuiMenuTriggerFor]',
    host: {
        '(click)': 'toggle()'
    }
})
export class WuiMenuTriggerFor {

    private overlay = inject(Overlay);
    private elementRef = inject(ElementRef);
    private viewContainerRef = inject(ViewContainerRef);

    menuTemplate = input.required<TemplateRef<unknown>>({alias: 'wuiMenuTriggerFor'});
    wuiMenuTriggerData = input<unknown>();

    private overlayRef : OverlayRef | null = null;
    private portal : TemplatePortal | null = null;

    private readonly positions: ConnectedPosition[] = [
        {
            originX: 'start', originY: 'bottom',
            overlayX: 'start', overlayY: 'top'
        },
        {
            originX: 'start', originY: 'top',
            overlayX: 'start', overlayY: 'bottom'
        }
    ];

    toggle() {
        this.overlayRef ? this.close() : this.open();
    }

    private open() {
        if(this.overlayRef?.hasAttached()) return;

        const config = new OverlayConfig({
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            positionStrategy: this.overlay
                .position()
                .flexibleConnectedTo(this.elementRef)
                .withPositions(this.positions),
            scrollStrategy: this.overlay.scrollStrategies.block()
        });

        this.overlayRef = this.overlay.create(config);
        this.portal = new TemplatePortal(this.menuTemplate(), this.viewContainerRef, {
            $implicit: this.wuiMenuTriggerData()
        });
        this.overlayRef.attach(this.portal);

        this.overlayRef.backdropClick().subscribe(() => this.close())
    }

    close() {
        this.overlayRef?.dispose();
        this.overlayRef = null;
        this.portal = null;
    }

    ngOnDestroy() {
        this.close();
    }
}