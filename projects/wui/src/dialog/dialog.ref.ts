import { OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { InjectionToken } from "@angular/core";
import { Subject } from "rxjs";
import { WuiDialog } from "./dialog";

export const WUI_DIALOG_REF = new InjectionToken("WUI_DIALOG_REF");

export class WuiDialogRef<T> {

    closed = new Subject<T | null>();

    constructor(
        private portal: ComponentPortal<WuiDialog>,
        private overlayRef: OverlayRef
    ) { }

    close(result: T | null) {
        this.overlayRef.detach();
        this.portal.detach();
        this.closed.next(result);
    }

}