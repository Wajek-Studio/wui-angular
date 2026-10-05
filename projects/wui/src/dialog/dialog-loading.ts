import { Component, computed, inject, signal, TemplateRef, viewChild } from "@angular/core";
import { WuiLoadingDialogConfig } from "./dialog-config";
import { WuiLoading } from "../loading/loading";
import { WuiDialogService } from "./dialog.service";
import { WuiDialogRef } from "./dialog.ref";

@Component({
    selector: 'wui-dialog-loading',
    template: `
        <ng-template #tpl>
            <div class="wui-dialog-content">
                <wui-loading [mode]="mode()" />
            </div>
        </ng-template>
    `,
    imports: [WuiLoading]
})
export class WuiDialogLoading {

    config = signal<WuiLoadingDialogConfig>({
        mode: 'circular'
    });

    mode = computed(() => this.config().mode);
    width = computed(() => this.config().width ?? 'auto');
    label = computed(() => this.config().label ?? null);

    dialogService = inject(WuiDialogService);

    tpl = viewChild.required<TemplateRef<any>>('tpl');

    open(config?: WuiLoadingDialogConfig): WuiDialogRef<void> {
        let confirmConfig: WuiLoadingDialogConfig = {
            mode: 'circular',
            ...config
        };

        this.config.set(confirmConfig);

        return this.dialogService.open(this.tpl(), {
            width: this.width(),
            dismissable: false
        });
    }

}