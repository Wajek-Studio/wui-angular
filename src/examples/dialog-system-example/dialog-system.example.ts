import { Component, inject } from "@angular/core";
import { WuiButton, WuiDialogService } from "@wajek/wui";

@Component({
    selector: 'dialog-system-example',
    template: `
    <div class="wui-flex wui-gap-col-3">
        <button wuiButton (click)="alert()">Alert</button>
        <button wuiButton (click)="confirm()">Confirm</button>
    </div>
    `,
    imports: [WuiButton]
})
export class DialogSystemExample {

    dialogService = inject(WuiDialogService);

    async alert() {
        this.dialogService.alert({
            title: 'Alert',
            message: 'This is just simple alert'
        });
    }

    async confirm() {
        let res = await this.dialogService.confirm({
            title: 'Alert',
            message: 'This is just simple alert',
            actions: ["Batal", "Hapus"]
        });
        console.log(res);
    }

}