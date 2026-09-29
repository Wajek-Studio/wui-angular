import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  WuiButton,
  WuiFormField,
  WuiInput,
  WuiLabel,
  WuiOption,
  WuiRadioButton,
  WuiRadioGroup,
  WuiSelect,
} from '@wajek/wui';

@Component({
  selector: 'form-reactive-full-example',
  imports: [
    ReactiveFormsModule,
    WuiButton,
    WuiFormField,
    WuiInput,
    WuiLabel,
    WuiSelect,
    WuiOption,
    WuiRadioGroup,
    WuiRadioButton,
  ],
  templateUrl: './form-reactive-full-example.html'
})
export class FormReactiveFullExample {
  readonly fullForm = new FormGroup({
    namaLengkap: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    departemen: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tipeAkun: new FormControl('personal', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    catatan: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
  });

  fullFormStatus = '(formulir belum dikirim)';

  onDepartemenChange(val: unknown): void {
    this.fullForm.controls.departemen.setValue(String(val ?? ''));
    this.fullForm.controls.departemen.markAsTouched();
  }

  pesanFull(field: 'namaLengkap' | 'email' | 'departemen' | 'catatan'): string {
    const ctrl = this.fullForm.controls[field];
    if (!ctrl.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'Bidang ini wajib diisi/dipilih.';
    if (ctrl.hasError('minlength')) return 'Minimal 3 karakter.';
    if (ctrl.hasError('maxlength')) return 'Maksimal 150 karakter.';
    if (ctrl.hasError('email')) return 'Format email tidak valid.';
    return 'Nilai tidak valid.';
  }

  simpanFull(): void {
    this.fullForm.markAllAsTouched();
    if (this.fullForm.invalid) {
      this.fullFormStatus = 'Gagal: Ada bidang yang belum valid.';
      return;
    }
    this.fullFormStatus = JSON.stringify(this.fullForm.getRawValue(), null, 2);
  }

  resetFull(): void {
    this.fullForm.reset();
    this.fullFormStatus = '(formulir direset)';
  }
}
