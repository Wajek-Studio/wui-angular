import { Component } from "@angular/core";

@Component({
    selector: 'wui-page',
    template: `
    <ng-content select="wui-topbar"/>
    <ng-content select=".wui-page-content"/>
    `,
    host: {
        class: 'wui-page'
    }
})
export class WuiPage { }