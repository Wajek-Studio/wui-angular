import { Component } from "@angular/core";
import { WuiFormField, WuiInput, WuiLabel, WuiError } from "@wajek/wui";

@Component({
    imports: [WuiFormField, WuiInput, WuiLabel, WuiError],
    selector: 'text-field-example',
    template: `
        <wui-form-field>
            <label for="text-field" wuiLabel>Text Input</label>
            <input wuiInput type="text" id="text-field" required [error]="true"/>
            <div wuiError>Harus diisi</div>
        </wui-form-field>
    `
})
export class TextFieldExample { }