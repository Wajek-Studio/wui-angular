import { Directive } from "@angular/core";

@Directive({
    selector: '[wuiError]',
    host: {
        class: 'wui-error'
    }
})
export class WuiError {}