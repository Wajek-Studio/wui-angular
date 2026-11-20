import { Component, signal } from "@angular/core";
import { WuiFormField, WuiInput, WuiLabel, WuiSuffix, WuiButton, WuiIcon } from "@wajek/wui";

@Component({
    imports: [WuiFormField, WuiInput, WuiLabel, WuiSuffix, WuiButton, WuiIcon],
    selector: 'text-field-password-example',
    template: `
        <wui-form-field>
            <label for="text-field-password" wuiLabel>Password</label>
            <input wuiInput [type]="showPassword() ? 'text' : 'password'" id="text-field-password"/>
            <div wuiSuffix>
                <button wuiButton iconOnly variant="text" (click)="toggleShowPassword()">
                    <wui-icon [icon]="showPassword() ? 'eye-off' : 'eye'"/>
                </button>
            </div>
        </wui-form-field>
    `
})
export class TextFieldPasswordExample {
    showPassword = signal(false);

    toggleShowPassword() {
        this.showPassword.update(show => !show);
    }
}