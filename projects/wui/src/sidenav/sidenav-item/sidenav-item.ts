import { Directive } from '@angular/core';

/**
 * Item tombol navigasi di dalam sidenav.
 *
 * Mengubah tombol menjadi berlebar penuh (100%), tanpa radius sudut,
 * serta menyelaraskan konten (ikon dan teks) rata kiri dengan padding token.
 * Mendukung state aktif via class `is-active` (mis. dari `routerLinkActive="is-active"`).
 */
@Directive({
  selector: '[wuiSidenavItem]',
  host: {
    class: 'wui-sidenav-item',
  },
})
export class WuiSidenavItem {}

/**
 * Wadah konten navigasi khusus mode mini (rail) di dalam sidenav.
 *
 * Isinya dibagi dua area: `[wuiSidenavBody]` (menggulir) dan `[wuiSidenavFooter]` (ujung bawah).
 *
 * ```html
 * <nav wuiSidenavMini>
 *   <div wuiSidenavBody>…</div>
 *   <div wuiSidenavFooter>…</div>
 * </nav>
 * ```
 */
@Directive({
  selector: '[wuiSidenavMini], [wuiSidenavMiniContent]',
  host: {
    class: 'wui-sidenav-mini-content',
  },
})
export class WuiSidenavMini {}

/**
 * Wadah konten navigasi lengkap (mode open) di dalam sidenav.
 *
 * Isinya dibagi dua area: `[wuiSidenavBody]` (menggulir) dan `[wuiSidenavFooter]` (ujung bawah).
 *
 * ```html
 * <nav wuiSidenavFull>
 *   <div wuiSidenavBody>…</div>
 *   <div wuiSidenavFooter>…</div>
 * </nav>
 * ```
 */
@Directive({
  selector: '[wuiSidenavFull], [wuiSidenavFullContent]',
  host: {
    class: 'wui-sidenav-full-content',
  },
})
export class WuiSidenavFull {}

