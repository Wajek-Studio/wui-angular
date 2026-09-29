import { WuiMenu } from "./menu";
import { WuiMenuTriggerFor } from "./menu-trigger";

export interface MenuEntry {
    trigger: WuiMenuTriggerFor;
    menu: WuiMenu | null
};