import { Directive, booleanAttribute, input } from '@angular/core';

import { WuiButtonColor, WuiButtonIconPos, WuiButtonSize, WuiButtonVariant } from './button.options';

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
 *
 * ## Warna
 *
 * Input `color` memilih peran warna — `default` (netral), `primary`, atau `danger` — dan berlaku
 * untuk ketiga varian:
 *
 * ```html
 * <button wuiButton>Netral (default)</button>
 * <button wuiButton color="primary">Brand</button>
 * <button wuiButton color="danger" variant="outlined">Hapus</button>
 * ```
 *
 * Warnanya berasal dari token peran (`--wui-color-default`, `--wui-color-primary`,
 * `--wui-color-danger`), yang bisa dipetakan aplikasi lewat `$wui-roles` di `styles.scss`.
 *
 * ## Ikon
 *
 * Satu `<wui-icon>` sebagai **anak langsung** tombol sudah cukup — tidak ada atribut penanda.
 * Sisinya ditentukan input `iconPos`, bukan urutan markup:
 *
 * ```html
 * <button wuiButton iconPos="start">
 *   <wui-icon icon="home"></wui-icon>
 *   Beranda
 * </button>
 *
 * <!-- ikon ditulis sesudah label, tetap tampil di depan -->
 * <button wuiButton iconPos="start">Pengaturan<wui-icon icon="settings"></wui-icon></button>
 *
 * <button wuiButton iconPos="end" variant="outlined">
 *   Lanjut
 *   <wui-icon icon="arrow-forward"></wui-icon>
 * </button>
 * ```
 *
 * Ukuran ikon mengikuti ukuran tombol, padding tombol tetap **simetris**, dan jarak ikon ↔ label
 * diatur `gap` tombol. Jangan menyetel input `size` pada `wui-icon` di dalam tombol — inline style-nya
 * mengalahkan `--wui-icon-size` milik tombol.
 *
 * ## Ikon-saja
 *
 * Tombol yang hanya berisi ikon ditandai `iconOnly` (atribut tanpa nilai) → tombol jadi persegi:
 * lebar = tinggi, padding dihitung dari selisih tinggi tombol dengan ukuran ikon.
 *
 * ```html
 * <button wuiButton iconOnly aria-label="Beranda">
 *   <wui-icon icon="home"></wui-icon>
 * </button>
 * ```
 *
 * `aria-label` wajib — nama aksesibel tidak bisa diambil dari nama ikon.
 *
 * ## Dipakai pada link (`<a>`)
 *
 * Directive ini tidak peduli jenis elemennya, jadi `<a wuiButton>` juga bekerja: underline bawaan
 * link dimatikan dan warnanya mengikuti varian. Berguna untuk navigasi yang tetap harus bisa dibuka
 * di tab baru atau disalin sebagai URL.
 *
 * ```html
 * <a wuiButton routerLink="/home">Kembali</a>
 *
 * <a wuiButton variant="outlined" iconPos="end" routerLink="/tipografi">
 *   Tipografi<wui-icon icon="home"></wui-icon>
 * </a>
 * ```
 *
 * Yang tidak berlaku di `<a>`: `disabled`, `type`, dan `form`. Untuk link yang tidak aktif, pakai
 * `aria-disabled="true"` (warnanya mengikuti state disabled dan tidak bisa diklik; tambahkan
 * `tabindex="-1"` bila perlu keluar dari urutan tab). Kalau tidak ada navigasi sama sekali,
 * pakai `<button>`.
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
    '[class.wui-button--icon-start]': "iconPos() === 'start'",
    '[class.wui-button--icon-end]': "iconPos() === 'end'",
    '[class.wui-button--icon-only]': 'iconOnly()',
    '[class.wui-button--color-default]': "color() === 'default'",
    '[class.wui-button--color-primary]': "color() === 'primary'",
    '[class.wui-button--color-danger]': "color() === 'danger'",
  },
})
export class WuiButton {
  /** Varian warna: `filled` (default), `outlined`, atau `text`. */
  readonly variant = input<WuiButtonVariant>('filled');

  /** Ukuran: `sm` | `md` (default) | `lg` | `xl`. */
  readonly size = input<WuiButtonSize>('md');

  /**
   * Sisi ikon: `start` (default) atau `end`.
   *
   * Hanya terasa bila tombol punya `<wui-icon>` anak langsung; sisi visual diatur CSS (`order`),
   * jadi posisi ikon di markup tidak berpengaruh.
   */
  readonly iconPos = input<WuiButtonIconPos>('start');

  /**
   * Tombol hanya berisi ikon (tanpa label teks) → tombol jadi persegi.
   *
   * Ditulis sebagai atribut tanpa nilai: `<button wuiButton iconOnly aria-label="…">`.
   * Penanda ini eksplisit karena CSS tidak bisa mendeteksi "tombol tanpa label teks".
   * `aria-label` wajib supaya tombol tetap punya nama aksesibel.
   */
  readonly iconOnly = input(false, { transform: booleanAttribute });

  /**
   * Peran warna: `default` (netral, default), `primary`, atau `danger`.
   *
   * Nilainya tidak disimpan di komponen — komponen hanya membaca token peran
   * (`--wui-color-default` / `-primary` / `-danger`), jadi mengganti warna cukup dari `$wui-roles`.
   */
  readonly color = input<WuiButtonColor>('default');
}
