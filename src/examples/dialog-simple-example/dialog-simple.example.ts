import { Component, DestroyRef, inject, TemplateRef, viewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { WuiButton, WuiDialogRef, WuiDialogService, WuiIcon } from "@wajek/wui";

@Component({
    selector: 'dialog-simple-example',
    templateUrl: './dialog-simple.example.html',
    imports: [WuiButton, WuiIcon]
})
export class DialogSimpleExample {
    
    destroyRef = inject(DestroyRef);
    dialogService = inject(WuiDialogService);

    templateRef = viewChild<TemplateRef<any>>('dialogTpl');
    dialogRef?: WuiDialogRef<string>;

    open() {
        this.dialogRef = this.dialogService.open(this.templateRef()!);
        this.dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async result => {
            console.log(result);
        });
    }

    async continue() {
        await this.dialogService.alert({
            title: 'Halo',
            message: 'Tidak ada'
        });
        this.dialogRef?.close('continue');
    }

    cancel() {
        this.dialogRef?.close('cancel');
    }

}