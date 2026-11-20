import { JsonPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WuiFormField, WuiInput, WuiLabel, WuiIcon, WuiButton, WuiSuffix, WuiPrefix, WuiHint, WuiError, WuiSelect, WuiOption, WuiRadioGroup, WuiRadioButton, WuiCheckbox } from '@wajek/wui';

interface Negara {
  value: string;
  label: string;
}

interface Kota {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'form-reactive-example',
  imports: [
    WuiFormField,
    WuiInput,
    WuiLabel,
    WuiIcon,
    WuiSuffix,
    WuiPrefix,
    WuiButton,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    WuiHint,
    WuiError,
    WuiSelect,
    WuiOption,
    WuiRadioGroup,
    WuiRadioButton,
    WuiCheckbox
],
  templateUrl: './form-reactive-example.html'
})
export class FormReactiveExample implements OnInit {

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);

  formVariant = signal<'outlined' | 'filled'>('outlined');
  disabled = signal<boolean>(false);
  simulateBackendError = signal<boolean>(false);

  formRegister = new FormGroup({
    nmLengkap: new FormControl<string | null>(null, Validators.required),
    email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    password: new FormControl<string | null>(null, Validators.required),
    jumlah: new FormControl<number | null>(null, [Validators.required]),
    negara: new FormControl<string | null>(null, Validators.required),
    kota: new FormControl<string | null>(null, Validators.required),
    agree: new FormControl<boolean | null>(null, Validators.required),
    profil: new FormControl<string | null>(null)
  });

  backendError = signal<Record<string, string>>({});

  formValue = signal<any>(null);
  showPassword = signal<boolean>(false);

  protected readonly dataNegara = signal<Negara[]>([
    { value: 'indonesia', label: 'Indonesia' },
    { value: 'malaysia', label: 'Malaysia' },
    { value: 'singapura', label: 'Singapura' },
  ]);

  protected readonly dataKota = signal<Kota[]>([
    { value: 'aceh', label: 'Banda Aceh' },
    { value: 'medan', label: 'Medan' },
    { value: 'padang', label: 'Padang' },
    { value: 'pekanbaru', label: 'Pekanbaru' },
    { value: 'batam', label: 'Batam' },
    { value: 'palembang', label: 'Palembang' },
    { value: 'lampung', label: 'Bandar Lampung' },
    { value: 'jakarta', label: 'Jakarta' },
    { value: 'bogor', label: 'Bogor' },
    { value: 'tangerang', label: 'Tangerang' },
    { value: 'bekasi', label: 'Bekasi' },
    { value: 'bandung', label: 'Bandung' },
    { value: 'cirebon', label: 'Cirebon' },
    { value: 'semarang', label: 'Semarang' },
    { value: 'solo', label: 'Surakarta (Solo)' },
    { value: 'yogya', label: 'Yogyakarta' },
    { value: 'surabaya', label: 'Surabaya' },
    { value: 'malang', label: 'Malang' },
    { value: 'denpasar', label: 'Denpasar' },
    { value: 'makassar', label: 'Makassar' },
  ]);

  toggleShowPassword() {
    this.showPassword.update(value => !value);
  }

  submit() {
    if(this.simulateBackendError() == true) {
      this.backendError.set({
        'nmLengkap': 'Nama lengkap sudah ada di database',
        'email': 'Email sudah terdaftar',
        'password': 'Password kurang kuat',
        'jumlah': 'Jumlah tidak boleh melebihi $3',
        'kota': 'Kota tidak terjangkau layanan kami',
        'negara': 'negara tidak terjangkau layanan kami',
      });

      this.formRegister.get('nmLengkap')?.setErrors({backend: true});
      this.formRegister.get('email')?.setErrors({backend: true});
      this.formRegister.get('password')?.setErrors({backend: true});
      this.formRegister.get('jumlah')?.setErrors({backend: true});
      this.formRegister.get('kota')?.setErrors({backend: true});
      this.formRegister.get('negara')?.setErrors({backend: true});
    }
    if(this.formRegister.invalid) return;
    this.formValue.set(this.formRegister.value);
  }

  onVariantChange(variant: any) {
    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: { variant },
      queryParamsHandling: 'merge'
    });
  }

  setDisable(disable: boolean) {
    this.disabled.set(disable);
    Object.keys(this.formRegister.controls).forEach((key: string) => {
      if(disable === true) {
        this.formRegister.get(key)?.disable();
      } else {
        this.formRegister.get(key)?.enable();
      }
    });
  }

  onDisableChange(disable: boolean) {
    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: { disable : disable ? 1 : 0 },
      queryParamsHandling: 'merge'
    })
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.formVariant.set(params['variant'] ?? 'outlined');
      this.setDisable(params['disable'] == 1 ? true : false);
    });
  }

}
