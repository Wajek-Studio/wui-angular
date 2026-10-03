import { createComponent, EnvironmentInjector, inject, Injectable, Injector, TemplateRef } from "@angular/core";
import { WUI_DIALOG_REF, WuiDialogRef } from "./dialog.ref";
import { Overlay, OverlayConfig } from "@angular/cdk/overlay";
import { WuiAlertDialogConfig, WuiConfirmDialogParam, WuiDialogConfig } from "./dialog-config";
import { ComponentPortal } from "@angular/cdk/portal";
import { WuiDialog } from "./dialog";
import { filter } from "rxjs";
import { WuiDialogAlert } from "./dialog-alert";
import { WuiDialogConfirm } from "./dialog-confirm";

@Injectable({
    providedIn: 'root'
})
export class WuiDialogService {

    private overlay = inject(Overlay);
    private injector = inject(Injector);
    private envInjector = inject(EnvironmentInjector);

    open<T>(template: TemplateRef<any>, config?: WuiDialogConfig): WuiDialogRef<T> {
        let dialogConfig : WuiDialogConfig = {
            width: '450px',
            height: 'auto',
            dismissable: true,
            ...config
        };

        const overlayRef = this.overlay.create({
            positionStrategy: this.overlay.position()
                .global()
                .centerHorizontally()
                .centerVertically(),
            hasBackdrop: true,
            width: dialogConfig.width,
            height: dialogConfig.height,
            maxWidth: dialogConfig.maxWidth,
            maxHeight: dialogConfig.maxHeight
        });

        let ref = new WuiDialogRef<T>(overlayRef);

        if(dialogConfig.dismissable) {
            overlayRef
                  .keydownEvents()
                  .pipe(filter(e => e.key === 'Escape'))
                  .subscribe(() => ref.close(null));

            let sub = overlayRef.backdropClick().subscribe(() => {
                sub.unsubscribe();
                ref.close(null);
            });
        }

        const portal = new ComponentPortal(
            WuiDialog, 
            null,
            this.injector
        );

        const componentRef = overlayRef.attach(portal);
        componentRef.changeDetectorRef.detectChanges();
        componentRef.instance.attachTemplate(template);
        return ref;
    }

    async alert(config?: WuiAlertDialogConfig) {
        const ref = createComponent(WuiDialogAlert, {
            environmentInjector: this.envInjector
        });
        return await ref.instance.open(config);
    }

    async confirm(config?: WuiConfirmDialogParam) {
        const ref = createComponent(WuiDialogConfirm, {
            environmentInjector: this.envInjector
        });
        return await ref.instance.open(config);
    }

}