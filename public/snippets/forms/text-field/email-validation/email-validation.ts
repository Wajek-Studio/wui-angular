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
  templateUrl: './email-validation.html',
})
export class EmailValidationComponent {
  emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  get pesanError(): string {
    if (!this.emailControl.touched || this.emailControl.valid) {
      return '';
    }
    if (this.emailControl.hasError('required')) {
      return 'Alamat email wajib diisi.';
    }
    if (this.emailControl.hasError('email')) {
      return 'Format email tidak valid (contoh: nama@domain.com).';
    }
    return 'Email tidak valid.';
  }
}
