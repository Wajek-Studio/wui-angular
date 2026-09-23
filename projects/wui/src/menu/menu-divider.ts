import { Directive } from '@angular/core';

/**
 * Garis pemisah antar kelompok item di dalam `<wui-menu>`.
 *
 * ```html
 * <wui-menu-item>Salin</wui-menu-item>
 * <hr wuiMenuDivider />
 * <wui-menu-item>Hapus</wui-menu-item>
 * ```
 *
 * Dipasang di `<hr>` supaya elemennya memang pemisah — sama polanya dengan `[wuiSidenavDivider]`.
 * Bukan `CdkMenuItem`, jadi ia tidak ikut navigasi panah dan tidak bisa difokus.
 */
@Directive({
  selector: '[wuiMenuDivider]',
  host: {
    class: 'wui-menu-divider',
  },
})
export class WuiMenuDivider {}
