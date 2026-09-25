import { Directive } from "@angular/core";

@Directive({
    selector: '[wuiContainer]',
    host: {
        '[class.wui-container]': 'true'
    }
})
export class WuiContainer { }