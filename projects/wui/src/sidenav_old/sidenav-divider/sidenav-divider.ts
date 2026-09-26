import { Directive } from '@angular/core';

/**
 * Garis horizontal tipis pemisah antar grup menu di dalam sidenav.
 *
 * ```html
 * <hr wuiSidenavDivider />
 * ```
 */
@Directive({
  selector: '[wuiSidenavDivider]',
  host: {
    class: 'wui-sidenav-divider',
  },
})
export class WuiSidenavDivider {}

/**
 * Label subheader / judul kategori menu di dalam sidenav.
 *
 * Berwarna adaptif dan kontras tinggi di mode terang maupun gelap
 * menggunakan token semantik `--wui-color-on-surface`.
 *
 * ```html
 * <div wuiSidenavSubheader>PENGATURAN</div>
 * ```
 */
@Directive({
  selector: '[wuiSidenavSubheader]',
  host: {
    class: 'wui-sidenav-subheader',
  },
})
export class WuiSidenavSubheader {}
