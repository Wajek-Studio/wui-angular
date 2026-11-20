import { Component } from "@angular/core";
import { WuiFormField, WuiInput, WuiLabel, WuiHint } from "@wajek/wui";

@Component({
    imports: [WuiFormField, WuiInput, WuiLabel, WuiHint],
    selector: 'text-field-date-example',
    template: `
        <div class="wui-grid wui-grid-col-3 wui-gap-col-4 wui-gap-row-4">
            <wui-form-field>
                <label for="text-field-date" wuiLabel>Date</label>
                <input wuiInput type="date" id="text-field-date" required/>
            </wui-form-field>
             <wui-form-field>
                <label for="text-field-time" wuiLabel>Time</label>
                <input wuiInput type="time" id="text-field-time" required/>
            </wui-form-field>
            <wui-form-field>
                <label for="text-field-datetime-local" wuiLabel>Date Time</label>
                <input wuiInput type="datetime-local" id="text-field-datetime-local" required/>
            </wui-form-field>
            <wui-form-field>
                <label for="text-field-month" wuiLabel>Month</label>
                <input wuiInput type="month" id="text-field-month" required/>
                <div wuiHint>Partial browser only</div>
            </wui-form-field>
            <wui-form-field>
                <label for="text-field-week" wuiLabel>Week</label>
                <input wuiInput type="week" id="text-field-week" required/>
                <div wuiHint>Partial browser only</div>
            </wui-form-field>
        </div>
    `
})
export class TextFieldDateExample { }