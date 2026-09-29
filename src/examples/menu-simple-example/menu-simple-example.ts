import { Component } from "@angular/core";
import { WuiButton, WuiMenuTriggerFor, WuiIcon, WuiMenu, WuiMenuItem } from "@wajek/wui";

@Component({
    selector: 'menu-simple-example',
    template: `
        <button wuiButton [wuiMenuTriggerFor]="menu" [wuiMenuTriggerData]="{idUser: 1, nmUser: 'Halo'}">Menu</button>
        <ng-template #menu let-user>
            <div wuiMenu>
                <a wuiMenuItem (click)="halo()">
                    <wui-icon icon="pencil"/>Edit
                </a>
                <a wuiMenuItem (click)="halo()">
                    <wui-icon icon="folder-move"/>Move to...
                </a>
                <a wuiMenuItem (click)="halo()">
                    <wui-icon icon="send-circle"/>Send to...
                </a>
                <div class="wui-menu-divider"></div>
                <a wuiMenuItem (click)="halo()">
                    <wui-icon icon="trash-can"/>Hapus
                </a>
            </div>
        </ng-template>
    `,
    imports: [WuiButton, WuiMenuTriggerFor, WuiIcon, WuiMenu, WuiMenuItem]
})
export class MenuSimpleExample {
    halo() {
        console.log('halo');
    }
}