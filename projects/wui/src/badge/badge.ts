import { Directive, booleanAttribute, input } from '@angular/core';
import { WuiBadgeColor, WuiBadgeSize, WuiBadgeVariant } from './badge.options';

/**
 * Komponen & Directive Badge untuk label status, indikator notifikasi, dan counter data.
 *
 * Mengikuti arsitektur tanpa dependensi Bootstrap:
 * - Menggunakan token warna semantik WUI (harmonis di tema terang maupun tema gelap).
 * - Mendukung varian visual: `filled` (pekat), `subtle` (pastel lembut), `outlined` (garis tepi).
 * - Mendukung bentuk `pill` (kapsul lonjong) dan `dot` (titik status tanpa teks).
 * - Mendukung penempatan `overlap` di pojok kanan atas tombol atau ikon.
 *
 * ```html
 * <!-- Status chip di tabel -->
 * <span wuiBadge color="success" variant="subtle" pill>Aktif</span>
 * <span wuiBadge color="warning" variant="subtle" pill>Tertunda</span>
 * <span wuiBadge color="error" pill>Non Aktif</span>
 *
 * <!-- Tag mandiri -->
 * <wui-badge color="primary">Baru</wui-badge>
 *
 * <!-- Badge notifikasi di tombol -->
 * <button wuiButton iconOnly>
 *   <wui-icon icon="bell"></wui-icon>
 *   <span wuiBadge color="error" pill overlap>5</span>
 * </button>
 * ```
 */
@Directive({
  selector: 'wui-badge, [wuiBadge], [wui-badge]',
  host: {
    class: 'wui-badge',
    '[class.wui-badge--default]': "color() === 'default'",
    '[class.wui-badge--primary]': "color() === 'primary'",
    '[class.wui-badge--secondary]': "color() === 'secondary'",
    '[class.wui-badge--success]': "color() === 'success'",
    '[class.wui-badge--error]': "color() === 'error' || color() === 'danger'",
    '[class.wui-badge--warning]': "color() === 'warning'",
    '[class.wui-badge--info]': "color() === 'info'",
    '[class.wui-badge--filled]': "variant() === 'filled'",
    '[class.wui-badge--subtle]': "variant() === 'subtle'",
    '[class.wui-badge--outlined]': "variant() === 'outlined'",
    '[class.wui-badge--sm]': "size() === 'sm'",
    '[class.wui-badge--md]': "size() === 'md'",
    '[class.wui-badge--lg]': "size() === 'lg'",
    '[class.wui-badge--pill]': 'pill()',
    '[class.wui-badge--dot]': 'dot()',
    '[class.wui-badge--overlap]': 'overlap()',
  },
})
export class WuiBadge {
  /** Peran warna badge (`default` | `primary` | `secondary` | `error` | `success` | `danger` | `warning` | `info`). */
  readonly color = input<WuiBadgeColor>('default');

  /** Gaya visual (`filled` | `subtle` | `outlined`). */
  readonly variant = input<WuiBadgeVariant>('filled');

  /** Ukuran badge (`sm` | `md` | `lg`). */
  readonly size = input<WuiBadgeSize>('md');

  /** Mengubah bentuk menjadi kapsul membulat penuh (`border-radius: 9999px`). */
  readonly pill = input(false, { transform: booleanAttribute });

  /** Mode bulatan kecil indikator status (tanpa teks). */
  readonly dot = input(false, { transform: booleanAttribute });

  /** Menempatkan posisi badge di pojok kanan atas elemen induk (untuk notifikasi tombol/ikon). */
  readonly overlap = input(false, { transform: booleanAttribute });
}
