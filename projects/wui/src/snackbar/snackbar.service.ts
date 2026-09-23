import { Overlay } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { inject, Injectable, Injector } from "@angular/core";
import { WuiSnackbarComponent } from "./snackbar.component";
import { WuiSnackbarRef } from "./snackbar.ref";
import { WUI_SNACKBAR_REF } from "./snackbar.tokens";

@Injectable({providedIn: 'root'})
export class WuiSnackbarService {

    private readonly overlay = inject(Overlay);
    private readonly injector = inject(Injector);

    private currentRef?: WuiSnackbarRef;

    open(message: string, duration = 3000): WuiSnackbarRef {
        this.close();

        // Membuat overlayRef
        const overlayRef = this.overlay.create({
            positionStrategy: this.overlay
                .position()
                .global()
                .right('1.5rem')
                .bottom('1.5rem'),
            hasBackdrop: false
        });

        let ref = new WuiSnackbarRef(overlayRef);

        const injector = Injector.create({
            providers: [{provide: WUI_SNACKBAR_REF, useValue: ref}],
            parent: this.injector    
        });

        // Membuat portal injector
        const portal = new ComponentPortal(
            WuiSnackbarComponent,
            null,
            injector
        );

        const componentRef = overlayRef.attach(portal);
        componentRef.instance.message = message;

        ref.attachComponent(componentRef);
        ref.setDuration(duration);

        this.currentRef = ref;

        ref.afterDismissed.subscribe(() => {
            if(this.currentRef === ref) {
                this.currentRef = undefined;
            }
        });

        return ref;
    }

    close(): void {
        this.currentRef?.dismiss();
        this.currentRef = undefined;
    }

}