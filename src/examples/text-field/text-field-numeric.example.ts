import { Component } from "@angular/core";
import { WuiFormField, WuiInput, WuiLabel, WuiPrefix, WuiIcon } from "@wajek/wui";

@Component({
    imports: [WuiFormField, WuiInput, WuiLabel, WuiPrefix, WuiIcon],
    selector: 'text-field-numeric-example',
    template: `
        <wui-form-field>
            <div wuiPrefix>
                <wui-icon icon="currency-usd"/>
            </div>
            <label for="text-field-numeric" wuiLabel>Enter Amount</label>
            <input wuiInput type="number" id="text-field-numeric" value="Halo" required/>
        </wui-form-field>
    `
})
export class TextFieldNumericExample { }