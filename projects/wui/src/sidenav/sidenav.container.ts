import { Component, Directive } from "@angular/core";

@Component({
    selector: 'wui-sidenav-container',
    template: `
        <ng-content select="wui-sidenav"/>
        <ng-content select="[wuiSidenavContainerContent]"/>
    `,
    host: {
        '[class.wui-sidenav-container]': 'true'
    }
})
export class WuiSidenavContainer { }

@Directive({
    selector: '[wuiSidenavContainerContent]',
    host: {
        '[class.wui-sidenav-container--content]': 'true'
    }
})
export class WuiSidenavContainerContent { }