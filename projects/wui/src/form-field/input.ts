import { DestroyRef, Directive, ElementRef, effect, inject } from '@angular/core';

import { FieldControl } from './field-control';
import { WuiFormField } from './form-field';

/**
 * Tampilan dan atribut a11y untuk kontrol di dalam `<wui-form-field>`.
 *
 * Dipasang pada elemen **native** (`input`/`textarea`) **dan** pada kontrol kustom milik library
 * (`wui-select`), jadi semua perilaku asli tetap milik browser: `type`,
 * `inputmode`, `autocomplete`, `required`, `disabled`, validasi bawaan, dan integrasi
 * `formControlName`/`ngModel` lewat `DefaultValueAccessor` Angular — directive ini tidak
 * menyentuh nilai sama sekali.
 *
 * ```html
 * <wui-form-field hint="Maksimal 200 karakter.">
 *   <label wuiLabel>Catatan</label>
 *   <textarea wuiInput rows="3" formControlName="catatan"></textarea>
 * </wui-form-field>
 * ```
 *
 * Yang dikerjakan directive ini:
 * - menambahkan class `.wui-input` (seluruh tampilannya dari style layer, bukan component style);
 * - memakai id buatan field kalau aplikasi tidak menulis `id` sendiri;
 * - menautkan pesan hint/error lewat `aria-describedby` dan menandai `aria-invalid="true"`.
 *
 * Atribut yang sudah ditulis aplikasi tidak hilang: nilai aslinya disimpan dan dikembalikan
 * saat directive dilepas, dan `aria-describedby` milik aplikasi digabung, bukan diganti.
 *
 * Pada kontrol kustom (`wui-select`) atribut itu ditulis di **host kontrolnya** — di situlah elemen
 * combobox yang difokus (keputusan L7) — dan satu langkah dilewati: placeholder kosong, sebab elemen
 * kustom tidak mengenal `:placeholder-shown`.
 */
@Directive({
  selector: 'input[wuiInput], textarea[wuiInput], wui-select[wuiInput]',
  host: { class: 'wui-input' },
})
export class WuiInput {
  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #field = inject(WuiFormField, { optional: true });
  readonly #destroyRef = inject(DestroyRef);

  /** Wiring atribut a11y — logikanya dipakai bersama `WuiSelect` (L8). */
  readonly #wiring = new FieldControl(this.#element.nativeElement);

  /** Kontrol kustom: tampilannya sama, tapi beberapa langkah wiring berbeda. */
  readonly #kustom = this.#element.nativeElement.tagName === 'WUI-SELECT';

  constructor() {
    // Placeholder satu spasi dipasang kalau aplikasi tidak menulisnya sendiri — **tidak** untuk
    // kontrol kustom (lihat `FieldControl.pasangPlaceholderKosong`).
    if (!this.#kustom) {
      this.#wiring.pasangPlaceholderKosong();
    }

    // Id milik aplikasi dilaporkan ke field supaya `for` label menunjuk elemen yang sama.
    const field = this.#field;

    if (field) {
      this.#wiring.laporkanIdKe(field);
    }

    // `effect()` berjalan setelah input field terpasang, jadi id & pesannya sudah final di sini.
    effect(() => {
      const field = this.#field;

      if (field) {
        this.#wiring.sinkronDengan(field);
      }
    });

    this.#destroyRef.onDestroy(() => this.#wiring.kembalikan());
  }
}
