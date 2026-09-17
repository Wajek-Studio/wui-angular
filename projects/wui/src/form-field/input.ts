import { DestroyRef, Directive, ElementRef, effect, inject } from '@angular/core';

import { WuiFormField } from './form-field';

/**
 * Tampilan dan atribut a11y untuk kontrol di dalam `<wui-form-field>`.
 *
 * Dipasang pada elemen **native**, jadi semua perilaku asli tetap milik browser: `type`,
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
 */
@Directive({
  selector: 'input[wuiInput], textarea[wuiInput]',
  host: { class: 'wui-input' },
})
export class WuiInput {
  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #field = inject(WuiFormField, { optional: true });
  readonly #destroyRef = inject(DestroyRef);

  /** Id yang sudah ditulis aplikasi (kalau ada) — tidak boleh ditimpa. */
  readonly #idAplikasi = this.#element.nativeElement.getAttribute('id');

  /** Nilai atribut sebelum wui mengubahnya, untuk dikembalikan saat directive dilepas. */
  readonly #sebelum = new Map<string, string | null>();

  constructor() {
    // Placeholder satu spasi dipasang kalau aplikasi tidak menulisnya sendiri. Alasannya CSS:
    // label mengapung memakai `:placeholder-shown` untuk tahu kontrol masih kosong, dan selektor
    // itu tidak pernah cocok kalau atribut `placeholder` tidak ada. Spasi tidak terlihat, dan
    // nilainya dikembalikan saat directive dilepas.
    if (!this.#element.nativeElement.hasAttribute('placeholder')) {
      this.#set('placeholder', ' ');
    }

    // Id milik aplikasi dilaporkan ke field supaya `for` label menunjuk elemen yang sama.
    this.#field?.reportControlId(this.#idAplikasi);

    // `effect()` berjalan setelah input field terpasang, jadi id & pesannya sudah final di sini.
    effect(() => {
      const field = this.#field;

      if (!field) {
        return;
      }

      if (!this.#idAplikasi) {
        this.#set('id', field.controlId());
      }

      this.#setDescribedBy(field.message() ? field.messageId() : null);
      this.#set('aria-invalid', field.invalid() ? 'true' : null);
    });

    this.#destroyRef.onDestroy(() => this.#kembalikan());
  }

  /** Tulis atribut sambil mengingat nilai aslinya (sekali saja per atribut). */
  #set(nama: string, nilai: string | null): void {
    const element = this.#element.nativeElement;

    if (!this.#sebelum.has(nama)) {
      this.#sebelum.set(nama, element.getAttribute(nama));
    }

    if (nilai === null) {
      element.removeAttribute(nama);
    } else {
      element.setAttribute(nama, nilai);
    }
  }

  /**
   * `aria-describedby` digabung dengan milik aplikasi — kalau aplikasi sudah menautkan elemen
   * lain (mis. pesan bantuan khusus), tautan itu tidak boleh hilang.
   */
  #setDescribedBy(pesanId: string | null): void {
    const element = this.#element.nativeElement;

    if (!this.#sebelum.has('aria-describedby')) {
      this.#sebelum.set('aria-describedby', element.getAttribute('aria-describedby'));
    }

    const asli = (this.#sebelum.get('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    const daftar = pesanId ? [...asli.filter((id) => id !== pesanId), pesanId] : asli;

    if (daftar.length) {
      element.setAttribute('aria-describedby', daftar.join(' '));
    } else {
      element.removeAttribute('aria-describedby');
    }
  }

  /** Kembalikan semua atribut yang diubah wui ke kondisi semula. */
  #kembalikan(): void {
    const element = this.#element.nativeElement;

    for (const [nama, nilai] of this.#sebelum) {
      if (nilai === null) {
        element.removeAttribute(nama);
      } else {
        element.setAttribute(nama, nilai);
      }
    }

    this.#sebelum.clear();
  }
}
