import { Directive } from "@angular/core";

@Directive({
    selector: '[wuiSuffix]',
    host: {
        class: 'wui-suffix'
    }
})
export class WuiSuffix {}