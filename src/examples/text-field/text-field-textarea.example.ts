import { Component } from "@angular/core";
import { WuiFormField, WuiInput, WuiLabel } from "@wajek/wui";

@Component({
    imports: [WuiFormField, WuiInput, WuiLabel],
    selector: 'text-field-textarea-example',
    template: `
        <wui-form-field>
            <label for="text-field-textarea" wuiLabel>Text Input</label>
            <textarea wuiInput name="text-field-textarea" id="text-field-textarea"></textarea>
        </wui-form-field>
    `
})
export class TextFieldTextareaExample { }