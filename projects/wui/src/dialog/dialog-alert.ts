import { Component, inject, signal, TemplateRef, viewChild } from "@angular/core";
import { WuiDialogService } from "./dialog.service";
import { WuiDialogRef } from "./dialog.ref";
import { WuiAlertDialogConfig } from "./dialog-config";
import { WuiButton } from "../public-api";

@Component({
    selector: 'wui-dialog-alert',
    template: `
        <ng-template #tpl>
            <div class="wui-dialog-header">{{title()}}</div>
            <div class="wui-dialog-content">{{message()}}</div>
            <div class="wui-dialog-buttons">
                <button wuiButton variant="text" (click)="close()">OK</button>
            </div>
        </ng-template>
    `,
    imports: [WuiButton]
})
export class WuiDialogAlert {

    dialogService = inject(WuiDialogService);
    dialogRef?: WuiDialogRef<void>;

    tpl = viewChild.required<TemplateRef<any>>('tpl');

    title = signal<string>('');
    message = signal<string>('');

    open(config?: WuiAlertDialogConfig): Promise<void> {
        return new Promise((resolve) => {
            let alertConfig: WuiAlertDialogConfig = {
                title: '',
                message: '',
                ...config
            };

            this.title.set(alertConfig.title ?? "");
            this.message.set(alertConfig.message ?? "");

            this.dialogRef = this.dialogService.open(this.tpl(), {
                width: '100%',
                maxWidth: '350px',
                dismissable: true
            });
            let sub = this.dialogRef.closed.subscribe(() => {
                sub.unsubscribe();
                resolve();
            });
        });
    }

    close() {
        this.dialogRef?.close();
    }

}