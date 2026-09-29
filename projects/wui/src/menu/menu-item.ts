import { Directive, inject, OnInit } from "@angular/core";
import { WuiMenuTriggerFor } from "./menu-trigger";

@Directive({
    selector: '[wuiMenuItem]',
    host: {
        class: 'wui-menu-item',
        '(click)': 'onClick()'
    }
})
export class WuiMenuItem {
    
    trigger = inject(WuiMenuTriggerFor, {optional: true});

    onClick() {
        this.trigger?.close();
    }

}