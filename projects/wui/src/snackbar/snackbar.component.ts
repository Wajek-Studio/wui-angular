import { Component, inject } from "@angular/core";
import { WuiSnackbarService } from "./snackbar.service";
import { WuiButton } from "../public-api";
import { WUI_SNACKBAR_REF } from "./snackbar.tokens";

@Component({
    imports: [WuiButton],
    selector: 'wui-snackbar',
    template: `
        <div class="wui-snackbar-label wui-label-medium">{{ message }}</div>
        <button wuiButton class="wui-snackbar-action" (click)="dismiss()" size="sm" variant="text">OK</button>
    `
})
export class WuiSnackbarComponent {

    private readonly ref = inject(WUI_SNACKBAR_REF);

    message = '';

    dismiss() : void {
        this.ref.dismiss();
    }

}