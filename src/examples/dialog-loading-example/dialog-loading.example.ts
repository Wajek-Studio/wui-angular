import { Component, inject } from "@angular/core";
import { WuiDialogService, WuiButton } from "@wajek/wui";

@Component({
    selector: 'dialog-loading-example',
    template: `
    <div class="wui-flex wui-gap-col-3">
        <button wuiButton (click)="circular()">Circular Loading Dialog</button>
        <button wuiButton (click)="linear()">Linear Loading Dialog</button>
    </div>
    `,
    imports: [WuiButton]
})
export class DialogLoadingExample {

    dialogService = inject(WuiDialogService);

    circular() {
        let ref = this.dialogService.loading();
        setTimeout(() => {
            ref.close();
        }, 3000);
    }

    linear() {
        let ref = this.dialogService.loading({
            mode: 'indeterminate',
            width: '150px'
        });
        setTimeout(() => {
            ref.close();
        }, 3000);
    }

}