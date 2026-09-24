import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  WuiButton,
  WuiFormField,
  WuiInput,
  WuiLabel,
  WuiOption,
  WuiSelect,
  WuiRadioGroup,
  WuiRadioButton,
} from '@wajek/wui';

@Component({
  imports: [
    ReactiveFormsModule,
    WuiFormField,
    WuiInput,
    WuiLabel,
    WuiSelect,
    WuiOption,
    WuiButton,
    WuiRadioGroup,
    WuiRadioButton,
  ],
  templateUrl: './reactive-full.html',
})
export class ReactiveFullComponent {
  readonly profileForm = new FormGroup({
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

  readonly statusSubmit = signal<string>('(formulir belum dikirim)');

  onDepartemenChange(val: unknown): void {
    this.profileForm.controls.departemen.setValue(String(val ?? ''));
    this.profileForm.controls.departemen.markAsTouched();
  }

  pesan(field: 'namaLengkap' | 'email' | 'departemen' | 'catatan'): string {
    const ctrl = this.profileForm.controls[field];
    if (!ctrl.touched || ctrl.valid) return '';

    if (ctrl.hasError('required')) return 'Bidang ini wajib diisi/dipilih.';
    if (ctrl.hasError('minlength')) return 'Minimal 3 karakter.';
    if (ctrl.hasError('maxlength')) return 'Maksimal 150 karakter.';
    if (ctrl.hasError('email')) return 'Format email tidak valid.';
    return 'Nilai tidak valid.';
  }

  simpan(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      this.statusSubmit.set('Gagal: Ada bidang yang belum valid.');
      return;
    }
    this.statusSubmit.set(JSON.stringify(this.profileForm.getRawValue(), null, 2));
  }

  resetForm(): void {
    this.profileForm.reset();
    this.statusSubmit.set('(formulir direset)');
  }
}
