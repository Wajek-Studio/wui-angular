import { OverlayRef } from "@angular/cdk/overlay";
import { InjectionToken } from "@angular/core";
import { Subject } from "rxjs";

export const WUI_DIALOG_REF = new InjectionToken("WUI_DIALOG_REF");

export class WuiDialogRef<T> {

    closed = new Subject<T | null>();

    constructor(
        private overlayRef: OverlayRef
    ) { }

    close(result: T | null) {
        this.overlayRef.detach();
        this.closed.next(result);
    }

}