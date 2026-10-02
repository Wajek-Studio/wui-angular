import { Component } from "@angular/core";
import { WuiFormField, WuiInput, WuiLabel } from "@wajek/wui";

@Component({
    imports: [WuiFormField, WuiInput, WuiLabel],
    selector: 'text-field-example',
    template: `
        <wui-form-field>
            <label for="text-field" wuiLabel>Text Input</label>
            <input wuiInput type="text" id="text-field" required/>
        </wui-form-field>
    `
})
export class TextFieldExample { }