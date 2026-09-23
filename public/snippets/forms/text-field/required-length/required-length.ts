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
  templateUrl: './required-length.html',
})
export class RequiredLengthComponent {
  usernameControl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
    ],
  });

  get pesanError(): string {
    if (!this.usernameControl.touched || this.usernameControl.valid) {
      return '';
    }
    if (this.usernameControl.hasError('required')) {
      return 'Nama pengguna wajib diisi.';
    }
    if (this.usernameControl.hasError('minlength')) {
      return 'Minimal 3 karakter.';
    }
    if (this.usernameControl.hasError('maxlength')) {
      return 'Maksimal 20 karakter.';
    }
    return 'Input tidak valid.';
  }
}
