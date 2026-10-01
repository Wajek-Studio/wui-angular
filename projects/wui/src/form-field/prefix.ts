import { Directive } from "@angular/core";

@Directive({
    selector: '[wuiPrefix]',
    host: {
        class: 'wui-prefix'
    }
})
export class WuiPrefix {}