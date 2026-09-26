import { Component, inject, input, OnDestroy, OnInit, signal } from "@angular/core";
import { WuiSidenavService } from "./sidenav.service";
import { Subject, takeUntil } from "rxjs";

@Component({
    selector: 'wui-sidenav',
    template: `
        <div class="wui-sidenav-content">
            <ng-content/>
        </div>
    `,
    host: {
        '[class.wui-sidenav]': 'true',
        '[class.wui-sidenav--show]': '_show()'
    }
})
export class WuiSidenav implements OnInit, OnDestroy {

    private sidenavService = inject(WuiSidenavService);

    id = input<string>('main');

    show = input(true);
    _show = signal(true);

    private unsub = new Subject<void>();

    ngOnInit(): void {
        this._show.set(this.show());
        this.sidenavService.register({
            id: this.id(),
            show: this._show()
        });
        this.sidenavService.stateChange.pipe(takeUntil(this.unsub)).subscribe((state) => {
            this._show.set(state.show);
        });
    }

    ngOnDestroy(): void {
        this.unsub.next();
        this.unsub.complete();
    }

}