import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { WuiFormInput, WuiInput, WuiLabel, WuiSelect, WuiOption, WuiPrefix, WuiIcon, WuiSuffix, WuiButton, WuiHint, WuiError } from "@wajek/wui";

@Component({
    selector: 'form-input-example',
    template: `
    <form [formGroup]="formReactive">
        <div class="wui-grid wui-grid-col-2 wui-gap-col-4 wui-gap-row-4">
            <wui-form-input>
                <label wuiLabel>Nama Lengkap</label>
                <input type="text" formControlName="fullName" wuiInput #fullName="wuiInput" placeholder="ex. John Doe">
                <div wuiPrefix><wui-icon icon="account"/></div>
                <div wuiSuffix>
                    <button wuiButton iconOnly size="sm" variant="text">
                        <wui-icon icon="dots-vertical"/>
                    </button>
                </div>
                <div wuiHint>Sesuai dengan identitas kependudukan</div>
                @if(fullName.firstError() == 'required') {
                    <div wuiError>Harus diisi</div>
                }
            </wui-form-input>

            <wui-form-input>
                <label wuiLabel>Email</label>
                <input type="email" formControlName="email" wuiInput #email="wuiInput" placeholder="ex. johndoe@gmail.com">
                <div wuiHint>Email aktif anda</div>
                @if(email.firstError() == 'required') {
                    <div wuiError>Harus diisi</div>
                }
                @if(email.firstError() == 'email') {
                    <div wuiError>Email tidak valid</div>
                }
            </wui-form-input>

            <wui-form-input>
                <label wuiLabel>Kota</label>
                <wui-select wuiInput formControlName="kota">
                    <wui-option value="indonesia">Indonesia</wui-option>
                </wui-select>
            </wui-form-input>

            <wui-form-input>
                <label wuiLabel>Negara</label>
                <wui-select wuiInput formControlName="negara">
                    <wui-option value="indonesia">Indonesia</wui-option>
                </wui-select>
            </wui-form-input>
        </div>
    </form>
    `,
    imports: [WuiFormInput, WuiInput, WuiLabel, WuiSelect, WuiOption, ReactiveFormsModule, WuiPrefix, WuiIcon, WuiSuffix, WuiButton, WuiHint, WuiError]
})
export class FormInputExample {

    formReactive = new FormGroup({
        fullName: new FormControl(null, Validators.required),
        email: new FormControl(null, [Validators.required, Validators.email]),
        kota: new FormControl(null, Validators.required),
        negara: new FormControl(null, Validators.required)
    });

}