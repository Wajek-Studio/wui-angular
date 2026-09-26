import { Component } from "@angular/core";

@Component({
    selector: 'wui-sidenav-container',
    template: `
        <ng-content select="wui-sidenav"/>
        <ng-content select=".wui-sidenav-container--content"/>
    `,
    host: {
        '[class.wui-sidenav-container]': 'true'
    }
})
export class WuiSidenavContainer { }