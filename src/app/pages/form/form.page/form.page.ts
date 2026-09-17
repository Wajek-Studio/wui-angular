import { Component, OnInit, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WuiButton, WuiFormField, WuiInput, WuiLabel, WuiPage, WuiPageService } from '@wajek/wui';

/**
 * Halaman demo `<wui-form-field>` + `[wuiInput]`.
 *
 * Dua hal yang diperagakan: field tanpa form (bagian 1–4) dan field yang pesan error-nya datang
 * dari validasi Reactive Forms (bagian 5). Kontrolnya elemen native, jadi `formControlName`
 * bekerja tanpa `ControlValueAccessor` buatan library.
 */
@Component({
  selector: 'app-form.page',
  imports: [RouterLink, ReactiveFormsModule, WuiButton, WuiFormField, WuiInput, WuiPage, WuiLabel],
  templateUrl: './form.page.html',
  styleUrl: './form.page.scss',
})
export class FormPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  protected readonly form = new FormGroup({
    nama: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
    catatan: new FormControl('', { nonNullable: true }),
  });

  protected readonly status = signal('(belum disimpan)');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }

  /**
   * Pesan error dari state form.
   *
   * Teks sengaja ada di aplikasi, bukan di library — tidak ada i18n yang dipaksakan
   * (lihat `docs/planning/wui-form-controls-plan.md`, K5).
   */
  protected pesan(nama: 'nama' | 'email'): string {
    const kontrol = this.form.controls[nama];

    if (!kontrol.touched || kontrol.valid) {
      return '';
    }

    if (kontrol.hasError('required')) {
      return 'Wajib diisi.';
    }

    if (kontrol.hasError('minlength')) {
      return 'Minimal 3 karakter.';
    }

    if (kontrol.hasError('email')) {
      return 'Format email tidak valid.';
    }

    return 'Nilai tidak valid.';
  }

  protected simpan(): void {
    // Menampilkan error hanya untuk kontrol yang sudah disentuh user, bukan sejak awal.
    this.form.markAllAsTouched();

    this.status.set(this.form.invalid ? 'form belum valid' : JSON.stringify(this.form.getRawValue()));
  }
}
