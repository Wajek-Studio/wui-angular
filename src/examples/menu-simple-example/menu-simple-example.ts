import { Component } from "@angular/core";
import { WuiButton, WuiMenuTriggerFor, WuiIcon } from "@wajek/wui";

@Component({
    selector: 'menu-simple-example',
    template: `
        <button wuiButton [wuiMenuTriggerFor]="menu" [wuiMenuTriggerData]="{idUser: 1, nmUser: 'Halo'}">Menu</button>
        <ng-template #menu let-user>
            <div class="wui-menu">
                <a class="wui-menu-item" href="#">
                    <wui-icon icon="pencil"/>Edit
                </a>
                <a class="wui-menu-item" href="#">
                    <wui-icon icon="folder-move"/>Move to...
                </a>
                <a class="wui-menu-item" href="#">
                    <wui-icon icon="send-circle"/>Send to...
                </a>
                <div class="wui-menu-divider"></div>
                <a class="wui-menu-item" href="#">
                    <wui-icon icon="trash-can"/>Hapus
                </a>
            </div>
        </ng-template>
    `,
    imports: [WuiButton, WuiMenuTriggerFor, WuiIcon]
})
export class MenuSimpleExample {}