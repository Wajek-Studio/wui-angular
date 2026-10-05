import { Directive } from "@angular/core";

@Directive({
    selector: '[wuiBackdrop]',
    host: {
        class: 'wui-backdrop'
    }
})
export class WuiBackdrop {
    
}