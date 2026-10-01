import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WuiFormField, WuiInput, WuiLabel, WuiIcon, WuiButton, WuiSuffix, WuiPrefix, WuiHint, WuiError, WuiSelect, WuiOption } from '@wajek/wui';

@Component({
  selector: 'form-filled-example',
  imports: [WuiFormField, WuiInput, WuiLabel, WuiIcon, WuiButton, WuiSuffix, WuiPrefix, ReactiveFormsModule, JsonPipe, WuiHint, WuiError, WuiSelect, WuiOption],
  templateUrl: './form-filled-example.html'
})
export class FormFilledExample {

  formRegister = new FormGroup({
    nmLengkap: new FormControl<string | null>('', Validators.required),
    email: new FormControl<string | null>('', [Validators.required, Validators.email]),
    password: new FormControl<string | null>('', Validators.required),
    jumlah: new FormControl<number | null>(null, [Validators.required]),
    negara: new FormControl<string | null>('', Validators.required),
    kota: new FormControl<string | null>('', Validators.required),
    profil: new FormControl<string | null>('')
  });

  formValue = signal<any>(null);

  submit() {
    console.log(this.formRegister.value);
    this.formValue.set(this.formRegister.value);
  }

}
