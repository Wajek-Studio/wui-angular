import { Component, inject, signal, TemplateRef, viewChild } from "@angular/core";
import { WuiDialogService } from "./dialog.service";
import { WuiDialogRef } from "./dialog.ref";
import { WuiConfirmDialogAction, WuiConfirmDialogConfig, WuiConfirmDialogParam } from "./dialog-config";
import { WuiButton } from "../public-api";

@Component({
    selector: 'wui-dialog-confirm',
    template: `
        <ng-template #tpl>
            <div class="wui-dialog-header">{{title()}}</div>
            <div class="wui-dialog-content">{{message()}}</div>
            <div class="wui-dialog-buttons">
                @for(action of actions(); track $index) {
                    <button wuiButton variant="text" (click)="close($index)">{{action.label}}</button>
                }
            </div>
        </ng-template>
    `,
    imports: [WuiButton]
})
export class WuiDialogConfirm {

    dialogService = inject(WuiDialogService);
    dialogRef?: WuiDialogRef<number | null>;

    tpl = viewChild.required<TemplateRef<any>>('tpl');

    title = signal<string>('');
    message = signal<string>('');
    actions = signal<WuiConfirmDialogAction[]>([]);

    open(config?: WuiConfirmDialogParam): Promise<number | null> {
        return new Promise((resolve) => {
            let confirmConfig: WuiConfirmDialogConfig = {
                title: '',
                message: '',
                ...config,
                actions: (config?.actions ?? []).map((a: WuiConfirmDialogAction | string) => {
                    if(typeof a == 'string') return <WuiConfirmDialogAction> {
                        label: a
                    };
                    return a;
                }),
            };

            this.title.set(confirmConfig.title ?? "");
            this.message.set(confirmConfig.message ?? "");
            this.actions.set(confirmConfig.actions ?? []);

            this.dialogRef = this.dialogService.open(this.tpl(), {
                width: '100%',
                maxWidth: '350px',
                dismissable: true
            });
            let sub = this.dialogRef.closed.subscribe((res) => {
                sub.unsubscribe();
                resolve(res);
            });
        });
    }

    close(result: number) {
        this.dialogRef?.close(result);
    }

}