import { OverlayRef } from "@angular/cdk/overlay";
import { ComponentRef } from "@angular/core";
import { Subject } from "rxjs";
import { WuiSnackbarComponent } from "./snackbar.component";

export class WuiSnackbarRef {

    private dismissed = false;
    private timeoutId?: ReturnType<typeof setTimeout>;

    private readonly $afterDismissed = new Subject<void>();
    readonly afterDismissed = this.$afterDismissed.asObservable();
    private componentRef?: ComponentRef<WuiSnackbarComponent>;

    constructor(
        private overlayRef: OverlayRef,
    ) {}

    private get host(): HTMLElement {
        return this.componentRef?.location.nativeElement;
    }

    attachComponent(componentRef: ComponentRef<WuiSnackbarComponent>) {
        this.componentRef = componentRef;
    }

    setDuration(duration: number): void {
        if (duration > 0) {
            this.timeoutId = setTimeout(() => this.dismiss(), duration);
        }
    }

    dismiss(): void {
        if(this.dismissed) return;
        this.dismissed = true;

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }

        const el = this.host;
        el.classList.add('wui-snackbar--leaving');
        el.addEventListener('animationend', () => {
            this.overlayRef.dispose();
            this.$afterDismissed.next();
            this.$afterDismissed.complete();
        });
    }
}