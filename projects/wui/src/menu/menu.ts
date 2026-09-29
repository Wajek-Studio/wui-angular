import { AfterContentInit, contentChildren, Directive, inject, OnInit } from "@angular/core";
import { WuiMenuItem } from "./menu-item";
import { WuiMenuStack } from "./menu-stack";
import { WuiMenuTriggerFor } from "./menu-trigger";

@Directive({
    selector: '[wuiMenu]',
    host: {
        class: 'wui-menu'
    }
})
export class WuiMenu implements OnInit {

    private stack = inject(WuiMenuStack);
    trigger = inject(WuiMenuTriggerFor, {optional: true});

    ngOnInit(): void {
        this.stack.registerMenu(this);
    }

}