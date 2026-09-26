import { Component, computed, inject, input, OnDestroy, OnInit, signal } from "@angular/core";
import { WuiSidenavService } from "./sidenav.service";
import { Subject, takeUntil } from "rxjs";

@Component({
    selector: 'wui-sidenav',
    template: `
        <ng-content/>
    `,
    host: {
        '[class.wui-sidenav]': 'true',
        '[class.wui-sidenav--show]': '_show()',
        '[class.wui-sidenav--mini]': '_isMini()'
    }
})
export class WuiSidenav implements OnInit, OnDestroy {

    private sidenavService = inject(WuiSidenavService);

    id = input<string>('main');

    mode = input<'full' | 'mini'>('full');
    _mode = signal<'full' | 'mini'>('full');
    
    _isMini = computed<boolean>(() => this._mode() == 'mini');

    show = input(true);
    _show = signal(true);

    private unsub = new Subject<void>();

    ngOnInit(): void {
        this._mode.set(this.mode());
        this._show.set(this.show());

        this.sidenavService.register({
            id: this.id(),
            show: this._show(),
            mode: this._mode()
        });
        this.sidenavService.stateChange.pipe(takeUntil(this.unsub)).subscribe((state) => {
            if(state.id != this.id()) return;
            this._show.set(state.show);
            this._mode.set(state.mode);
        });
    }

    ngOnDestroy(): void {
        this.unsub.next();
        this.unsub.complete();
    }

}