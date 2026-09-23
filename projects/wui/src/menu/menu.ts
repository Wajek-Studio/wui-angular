import { CdkMenu } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Permukaan menu: panel Melayang tempat `<wui-menu-item>` diletakkan.
 *
 * ```html
 * <ng-template #menu>
 *   <wui-menu>
 *     <wui-menu-item (triggered)="salin()">Salin</wui-menu-item>
 *     <wui-menu-item disabled>Hapus</wui-menu-item>
 *   </wui-menu>
 * </ng-template>
 * ```
 *
 * Mesinnya milik CDK (`cdk/menu` lewat `hostDirectives`): peran `role="menu"`, navigasi panah,
 * type-ahead, `Home`/`End`, dan penutupan lewat `Escape`/`Tab` semuanya dari `CdkMenu` — komponen
 * ini hanya memasang class `.wui-menu` dan satu perilaku tambahan di bawah.
 *
 * Isi menu **diproyeksikan** (`<ng-content>`): aplikasi bebas menaruh ikon, dua baris teks, atau
 * `<hr wuiMenuDivider />` di dalamnya, dan tetap mendapat tata letak default dari style layer.
 */
@Component({
  selector: 'wui-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  hostDirectives: [CdkMenu],
  host: {
    class: 'wui-menu',

    // `Escape` di dalam menu hanya boleh menutup **satu tingkat** — menunya saja. Tanpa ini,
    // `CdkMenu` memanggil `preventDefault()` tapi tidak menghentikan propagasi, sedangkan listener
    // `Escape` dialog/page bekerja di tingkat dokumen: satu tombol akan menutup menu **dan**
    // dialognya sekaligus (terukur di spike F0, `wui-context-menu-plan.md` §9 baris 6).
    //
    // `stopPropagation()` (bukan `stopImmediatePropagation()`) sengaja dipakai: listener CDK di
    // elemen yang sama tetap berjalan, jadi menunya memang tertutup — hanya gelembungnya berhenti.
    '(keydown.escape)': '$event.stopPropagation()',
  },
})
export class WuiMenu {}
