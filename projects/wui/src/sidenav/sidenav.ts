import { Component, effect, forwardRef, inject, input, model, OnInit } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { WUI_SIDENAV_CONTAINER, WUI_SIDENAV_PARENT } from "./sidenav.token";
import { WuiSidenavContainer } from "./sidenav-container";
import { combineLatestWith, merge, skip } from "rxjs";
import { WuiScrollbar } from "../public-api";

@Component({
    selector: 'wui-sidenav',
    template: `
    <div class="wui-sidenav-inner">
        <ng-content/>
    </div>
    `,
    host: {
        class: 'wui-sidenav',
        '[class.wui-sidenav--show]': "show()",
        '[class.wui-sidenav--over]': "mode() == 'over'",
        '[class.wui-sidenav--side]': "mode() == 'side'"
    },
    providers: [{
        provide: WUI_SIDENAV_PARENT,
        useExisting: forwardRef(() => WuiSidenav)
    }]
})
export class WuiSidenav implements OnInit {

    container = inject<WuiSidenavContainer>(WUI_SIDENAV_CONTAINER);

    mode = input<'over' | 'side'>('over');
    modeChange = toObservable(this.mode);

    show = model<boolean>(false);
    showChange = toObservable(this.show);

    initialized = false;

    ngOnInit(): void {
        this.showChange.pipe(combineLatestWith(this.modeChange)).subscribe(([show, mode]) => {
            if(show) {
                if(mode == 'over') {
                    if(this.container?.backdropState() == 'open') return;
                    this.container?.openBackdrop();
                } else {
                    if(this.container?.backdropState() == 'hidden') return;
                    this.container?.closeBackdrop();
                }
            } else {
                if(this.container?.backdropState() == 'hidden') return;
                this.container?.closeBackdrop();
            }
        });

        this.container.backdropClick.subscribe(() => {
            if(this.show() === true) this.show.set(false);
        });
    }

}