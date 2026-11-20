import { Component, inject, TemplateRef, viewChild } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { WuiFormField, WuiInput, WuiLabel, WuiButton, WuiDialogService, WuiError } from "@wajek/wui";

@Component({
    selector: 'dialog-form-example',
    templateUrl: './dialog-form.example.html',
    imports: [ReactiveFormsModule, WuiFormField, WuiInput, WuiLabel, WuiButton, WuiError]
})
export class DialogFormExample {

    formReactive = new FormGroup({
        fullName: new FormControl(null, Validators.required)
    });

    dialogService = inject(WuiDialogService);
    dialogTpl = viewChild.required<TemplateRef<any>>('dialogTpl');

    open() {
        this.formReactive.reset();
        this.dialogService.open(this.dialogTpl());
    }

}