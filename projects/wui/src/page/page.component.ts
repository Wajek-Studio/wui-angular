import { Component } from "@angular/core";

@Component({
    selector: 'wui-page',
    template: `
    <div class="wui-page-container">
        <ng-content select="wui-sidenav"/>
        <ng-content select=".wui-page-content"/>
    </div>
    `
})
export class WuiPage { }