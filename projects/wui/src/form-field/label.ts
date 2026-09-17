import { Directive, ElementRef, effect, inject } from '@angular/core';

import { WuiFormField } from './form-field';

/**
 * Label untuk `<wui-form-field>`.
 *
 * Label **diproyeksikan aplikasi**, bukan dirender field — yang penting ia berada di dalam
 * `<wui-form-field>`:
 *
 * ```html
 * <wui-form-field hint="Sesuai kartu identitas.">
 *   <label wuiLabel>Nama lengkap</label>
 *   <input wuiInput type="text" />
 * </wui-form-field>
 * ```
 *
 * Field yang mengisi atribut `for` supaya label terhubung ke kontrolnya: tanpa itu klik label tidak
 * memfokuskan apa pun, dan screen reader tidak punya nama untuk kontrolnya. Kalau aplikasi menulis
 * `for` sendiri (mis. karena kontrolnya juga punya `id` sendiri), nilainya dihormati apa adanya.
 *
 * Tampilannya — termasuk animasi mengapung — datang dari style layer lewat class
 * `.wui-form-field__label`, bukan dari component style, sama seperti kontrolnya.
 */
@Directive({
  selector: 'label[wuiLabel]',
  host: { class: 'wui-form-field__label' },
})
export class WuiLabel {
  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #field = inject(WuiFormField, { optional: true });

  /** `for` yang sudah ditulis aplikasi — tidak boleh ditimpa. */
  readonly #forAplikasi = this.#element.nativeElement.getAttribute('for');

  constructor() {
    // `effect()` berjalan setelah input field terpasang, jadi id kontrol sudah final di sini —
    // termasuk kalau kontrolnya menulis `id` sendiri (`WuiInput` melaporkannya ke field).
    effect(() => {
      const field = this.#field;

      if (!field || this.#forAplikasi) {
        return;
      }

      this.#element.nativeElement.setAttribute('for', field.controlId());
    });
  }
}