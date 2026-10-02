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
  selector: 'form-simple-example',
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
  templateUrl: './form-simple-example.html'
})
export class FormSimpleExample implements OnInit {

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);

  formRegister = new FormGroup({
    nmLengkap: new FormControl<string | null>(null, Validators.required),
    email: new FormControl<string | null>({
      value: null,
      disabled: true
    }, [Validators.required, Validators.email]),
    password: new FormControl<string | null>(null, Validators.required),
    jumlah: new FormControl<number | null>(null, [Validators.required]),
    negara: new FormControl<string | null>({
      value: 'indonesia',
      disabled: true
    }, Validators.required),
    kota: new FormControl<string | null>(null, Validators.required),
    agree: new FormControl<boolean | null>(null, Validators.required),
    profil: new FormControl<string | null>(null)
  });

  backendError : any = {};

  formValue = signal<any>(null);
  showPassword = signal<boolean>(false);

  formVariant = signal<'outlined' | 'filled'>('outlined');

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
    this.formRegister.controls['nmLengkap'].setErrors({backend: true});
    this.backendError['nmLengkap'] = 'Nama sudah digunakan, pilih yang lain';

    this.formRegister.controls['email'].setErrors({backend: true});
    this.backendError['email'] = 'Email sudah digunakan';

    console.log(this.backendError);

    if(this.formRegister.invalid) return;
    this.formValue.set(this.formRegister.value);
  }

  onVariantChange(variant: any) {
    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: { variant }
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.formVariant.update(variant => params['variant'] ?? 'outlined');
    });
  }

}
