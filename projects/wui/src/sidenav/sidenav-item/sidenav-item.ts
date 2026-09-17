import { Directive } from '@angular/core';

/**
 * Wadah menu navigasi di dalam sidenav.
 *
 * ```html
 * <nav wuiSidenavMenu>
 *   <a wuiButton variant="text" size="lg" routerLink="/home" wuiSidenavItem>
 *     <wui-icon icon="home"></wui-icon>
 *     Beranda
 *   </a>
 * </nav>
 * ```
 */
@Directive({
  selector: '[wuiSidenavInner]',
  host: {
    class: 'wui-sidenav-inner',
  },
})
export class WuiSidenavInner {}

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
 * ```html
 * <nav wuiSidenavInner wuiSidenavMini>...</nav>
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
 * ```html
 * <nav wuiSidenavInner wuiSidenavFull>...</nav>
 * ```
 */
@Directive({
  selector: '[wuiSidenavFull], [wuiSidenavFullContent]',
  host: {
    class: 'wui-sidenav-full-content',
  },
})
export class WuiSidenavFull {}

