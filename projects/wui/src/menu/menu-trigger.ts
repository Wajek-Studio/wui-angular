import { ConnectedPosition, Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { Directive, ElementRef, inject, Injector, input, TemplateRef, ViewContainerRef } from "@angular/core";
import { WuiMenuStack } from "./menu-stack";
import { WUI_MENU_CONFIG } from "./menu-config";

@Directive({
    selector: '[wuiMenuTriggerFor]',
    host: {
        '(click)': 'toggle()'
    },
    providers: [
        
    ]
})
export class WuiMenuTriggerFor {

    private config = inject(WUI_MENU_CONFIG);
    private stack = inject(WuiMenuStack);

    private overlay = inject(Overlay);
    private elementRef = inject(ElementRef);
    private viewContainerRef = inject(ViewContainerRef);

    menuTemplate = input.required<TemplateRef<unknown>>({alias: 'wuiMenuTriggerFor'});
    wuiMenuTriggerData = input<unknown>();

    private overlayRef: OverlayRef | null = null;
    private portal: TemplatePortal | null = null;

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
                .withPositions(this.config.positions![this.config.defaultPosition!]),
            scrollStrategy: this.overlay.scrollStrategies.block()
        });

        const injector = Injector.create({
            parent: this.viewContainerRef.injector,
            providers: [{
                provide: WuiMenuTriggerFor, useValue: this
            }]
        });

        this.stack.push(this);

        this.overlayRef = this.overlay.create(config);
        this.portal = new TemplatePortal(
            this.menuTemplate(),  // the template
            this.viewContainerRef, // view container ref
            {
                $implicit: this.wuiMenuTriggerData()
            }, // data
            injector // injector
        );
        this.overlayRef.attach(this.portal);
        this.overlayRef.backdropClick().subscribe(() => this.close())
    }

    close() {
        this.overlayRef?.dispose();
        this.overlayRef = null;
        this.portal = null;
        this.stack.pop();
    }

    ngOnDestroy() {
        this.close();
    }
}