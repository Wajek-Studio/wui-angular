import { Directive } from "@angular/core";

@Directive({
    selector: '[wuiHint]',
    host: {
        class: 'wui-hint'
    }
})
export class WuiHint {}