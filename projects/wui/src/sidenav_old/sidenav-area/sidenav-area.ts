import { Directive } from '@angular/core';

/**
 * Area isi sidenav — mengisi seluruh tinggi yang tersisa dan **boleh digulir**.
 *
 * Sidenav selalu dibagi dua area, dan pembagiannya sama untuk mode mini maupun penuh:
 *
 * | Area | Directive | Perlakuannya |
 * | --- | --- | --- |
 * | Isi | `wuiSidenavBody` | setinggi sisa panel, `overflow-y: auto` |
 * | Bawah | `wuiSidenavFooter` | menempel di ujung bawah, tidak ikut tergulir |
 *
 * Keduanya ditaruh **di dalam** blok `wuiSidenavMini` / `wuiSidenavFull` (bukan di dalam
 * `<wui-sidenav>` langsung), karena tiap mode punya blok markup sendiri.
 *
 * ```html
 * <wui-sidenav id="app-sidenav">
 *   <nav wuiSidenavFull>
 *     <div wuiSidenavBody>
 *       <a wuiButton wuiSidenavItem>Beranda</a>
 *       <!-- daftar panjang: menggulir di sini, bukan menonjol keluar panel -->
 *     </div>
 *     <div wuiSidenavFooter>
 *       <a wuiButton wuiSidenavItem>Pengaturan</a>
 *     </div>
 *   </nav>
 * </wui-sidenav>
 * ```
 */
@Directive({
  selector: '[wuiSidenavBody]',
  host: {
    class: 'wui-sidenav-body',
  },
})
export class WuiSidenavBody {}

/**
 * Area bawah sidenav — **selalu di ujung bawah**, tidak ikut tergulir bersama
 * `[wuiSidenavBody]`.
 *
 * Garis pemisah di atasnya digambar oleh style layer (`border-top`), jadi tidak perlu lagi
 * `<hr wuiSidenavDivider />` sebelum item terakhir.
 */
@Directive({
  selector: '[wuiSidenavFooter]',
  host: {
    class: 'wui-sidenav-footer',
  },
})
export class WuiSidenavFooter {}
