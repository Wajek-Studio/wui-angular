import { Directive, booleanAttribute, input } from '@angular/core';

/**
 * Directive untuk elemen `<table>` native.
 *
 * Mengikuti arsitektur directive native WUI (seperti `wuiButton`):
 * mempertahankan elemen `<table>` native agar seluruh semantik HTML dan
 * pohon aksesibilitas browser (caption, thead, tbody, tfoot, th scope) tetap utuh.
 *
 * ```html
 * <table wuiTable>
 *   <thead>...</thead>
 *   <tbody>...</tbody>
 * </table>
 *
 * <table wuiTable hover>
 *   ...
 * </table>
 * ```
 */
@Directive({
  selector: 'table[wuiTable], table[wui-table]',
  host: {
    class: 'wui-table',
    '[class.wui-table-hover]': 'hover()',
    '[class.wui-table--dense]': 'dense()',
    '[class.wui-table--alternate]': 'alternate()',
  },
})
export class WuiTable {
  /** Memberi highlight visual saat baris tabel disorot kursor (hover). */
  readonly hover = input(false, { transform: booleanAttribute });

  /** Mode baris padat / kompak dengan tinggi baris lebih ringkas. */
  readonly dense = input(false, { transform: booleanAttribute });

  /** Mode baris belang-belang ganjil/genap (zebra-striping) dengan warna latar tipis. */
  readonly alternate = input(false, { transform: booleanAttribute });
}

/**
 * Kontainer pembungkus responsif untuk tabel.
 *
 * Mengaktifkan horizontal scrollbar bila tabel lebih lebar dari layar tanpa merusak layout.
 *
 * ```html
 * <div wuiTableResponsive>
 *   <table wuiTable>...</table>
 * </div>
 * ```
 */
@Directive({
  selector: '[wuiTableResponsive], [wui-table-responsive]',
  host: {
    class: 'wui-table-responsive',
  },
})
export class WuiTableResponsive {}
