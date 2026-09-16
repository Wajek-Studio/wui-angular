import { Directive, input } from '@angular/core';

import { WuiButtonSize, WuiButtonVariant } from './button.options';

/**
 * Tombol Material 3.
 *
 * Dipasang sebagai atribut pada `<button>` **native** — bukan elemen baru — supaya perilaku
 * bawaan browser tetap utuh: `disabled`, `type`, `form`, dan aksesibilitasnya.
 *
 * ```html
 * <button wuiButton>Filled</button>
 * <button wuiButton variant="outlined" size="lg">Outlined</button>
 * <button wuiButton variant="text" size="sm">Text</button>
 * <button wuiButton disabled>Tidak aktif</button>
 * ```
 *
 * Directive ini tidak menyimpan style apa pun; ia hanya memasang class yang menjadi kontrak
 * `scss/components/_button.scss`:
 *
 * - `.wui-button` — bentuk dasar + ukuran `md` (default filled),
 * - `.wui-button--filled` / `--outlined` / `--text` — varian warna,
 * - `.wui-button--sm` / `--md` / `--lg` / `--xl` — ukuran.
 *
 * Karena semua warna dan ukuran lewat token, mengganti palet aplikasi atau mengubah
 * `$wui-button-sizes` langsung terasa di sini tanpa menyentuh template.
 */
@Directive({
  selector: '[wuiButton]',
  host: {
    class: 'wui-button',
    '[class.wui-button--filled]': "variant() === 'filled'",
    '[class.wui-button--outlined]': "variant() === 'outlined'",
    '[class.wui-button--text]': "variant() === 'text'",
    '[class.wui-button--sm]': "size() === 'sm'",
    '[class.wui-button--md]': "size() === 'md'",
    '[class.wui-button--lg]': "size() === 'lg'",
    '[class.wui-button--xl]': "size() === 'xl'",
  },
})
export class WuiButton {
  /** Varian warna: `filled` (default), `outlined`, atau `text`. */
  readonly variant = input<WuiButtonVariant>('filled');

  /** Ukuran: `sm` | `md` (default) | `lg` | `xl`. */
  readonly size = input<WuiButtonSize>('md');
}
