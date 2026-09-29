import { Injectable } from "@angular/core";
import { MenuEntry } from "./menu-entry";
import { WuiMenuTriggerFor } from "./menu-trigger";
import { WuiMenu } from "./menu";

@Injectable({providedIn: 'root'})
export class WuiMenuStack {

    private _entries: MenuEntry[] = [];

    push(trigger: WuiMenuTriggerFor) {
        this._entries.push({trigger, menu: null});
    }

    pop() {
        this._entries.pop();
    }

    registerMenu(menu: WuiMenu) {
        const entry = this._entries.find(e => e.trigger === menu.trigger);
        if(entry) entry.menu = menu;
    }

}