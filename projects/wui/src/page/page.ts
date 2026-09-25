import { Component, Directive } from "@angular/core";

@Directive({
    selector: '[wuiPageContent]',
    host: {
        '[class.wui-page--content]': 'true'
    }
})
export class WuiPageContent { }

@Component({
    selector: 'wui-page',
    template: `
    <ng-content select="wui-topbar"/>
    <ng-content select="[wuiPageContent]"/>
    `,
    host: {
        '[class.wui-page]': 'true'
    }
})
export class WuiPage { }