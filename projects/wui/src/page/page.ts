import { Component, Directive } from "@angular/core";

@Directive({
    selector: '[wuiPageContent]',
    host: {
        '[class.wui-page-content]': 'true'
    }
})
export class WuiPageContent { }

@Component({
    selector: 'wui-page',
    template: `
    <ng-content select="wui-topbar"/>
    <div class="wui-page-container">
        <ng-content select="wui-sidenav"/>
        <ng-content select="[wuiPageContent]"/>
    </div>
    `
})
export class WuiPage { }