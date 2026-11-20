import { Component, contentChildren, forwardRef, signal } from "@angular/core";
import { WuiSidenav } from "./sidenav";
import { WUI_SIDENAV_CONTAINER } from "./sidenav.token";
import { Subject } from "rxjs";

@Component({
    selector: 'wui-sidenav-container',
    template: `
        @if(backdropState() != 'hidden') {
            <div class="wui-sidenav-backdrop" 
                [class.wui-sidenav-backdrop--closing]="backdropState() == 'closing'"
                (animationend)="onBackdropAnimationEnd()"
                (click)="onBackdropClick()"
            ></div>
        }
        <ng-content select="wui-sidenav"/>
        <ng-content select=".wui-sidenav-container-content"/>
    `,
    host: {
        class: 'wui-sidenav-container'
    },
    providers: [{
        provide: WUI_SIDENAV_CONTAINER,
        useExisting: forwardRef(() => WuiSidenavContainer)
    }]
})
export class WuiSidenavContainer {

    sidenav = contentChildren(WuiSidenav);
    backdropState = signal<'hidden' | 'opening' | 'open' | 'closing'>('hidden');
    backdropClick = new Subject<void>();

    openBackdrop() {
        this.backdropState.set('opening');
    }

    closeBackdrop() {
        this.backdropState.set('closing');
    }

    onBackdropAnimationEnd() {
        if(this.backdropState() == 'closing') {
            this.backdropState.set('hidden');
        }
    }

    onBackdropClick() {
        this.backdropClick.next();
    }
}