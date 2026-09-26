import { Component, input } from "@angular/core";

@Component({
    selector: 'wui-sidenav',
    template: `
        <ng-content/>
    `,
    host: {
        '[class.wui-sidenav]': 'true',
        '[class.wui-sidenav--show]': 'show()'
    }
})
export class WuiSidenav {

    show = input(true);

}