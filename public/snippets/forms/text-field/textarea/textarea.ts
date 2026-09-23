import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { WuiFormField, WuiInput, WuiLabel } from '@wajek/wui';

@Component({
  imports: [
    ReactiveFormsModule,
    WuiFormField,
    WuiInput,
    WuiLabel,
  ],
  templateUrl: './textarea.html',
})
export class TextareaComponent {
  catatanControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(200)],
  });

  get pesanError(): string {
    if (!this.catatanControl.touched || this.catatanControl.valid) {
      return '';
    }
    if (this.catatanControl.hasError('required')) {
      return 'Catatan pengiriman wajib diisi.';
    }
    if (this.catatanControl.hasError('maxlength')) {
      return 'Catatan maksimal 200 karakter.';
    }
    return 'Input tidak valid.';
  }
}
