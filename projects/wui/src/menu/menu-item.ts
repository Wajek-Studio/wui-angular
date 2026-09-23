import { CdkMenuItem } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Satu aksi di dalam `<wui-menu>`.
 *
 * ```html
 * <wui-menu-item (triggered)="salin()">
 *   <wui-icon icon="content-copy" /> Salin
 * </wui-menu-item>
 * <wui-menu-item disabled>Hapus</wui-menu-item>
 * ```
 *
 * Seperti `<wui-menu>`, perilakunya milik `CdkMenuItem` (lewat `hostDirectives`): peran
 * `role="menuitem"`, `tabindex` yang berpindah mengikuti fokus, `aria-disabled`, aktif lewat
 * `Enter`/`Space`/klik, dan label untuk type-ahead. Yang ditulis di sini hanya permukaan API-nya:
 * `disabled`, `typeaheadLabel`, dan output `triggered`.
 *
 * **Catatan penamaan yang mudah salah**: nama binding publik CDK-nya `cdkMenuItemDisabled` dan
 * `cdkMenuitemTypeaheadLabel` (huruf `i` kecil di "Menuitem" — memang begitu di CDK). Nama itulah
 * yang dipakai pemetaan `inputs`, sedangkan aplikasi selalu menulis `disabled`/`typeaheadLabel`.
 *
 * Isi item diproyeksikan, jadi satu item boleh berisi apa pun — tetapi jangan menaruh kontrol
 * interaktif (tautan/tombol) di dalamnya: `role="menuitem"` sudah berarti elemen itu sendiri yang
 * dapat diaktifkan, dan kliknya akan berebut dengan `CdkMenuItem`.
 */
@Component({
  selector: 'wui-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  hostDirectives: [
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuitemTypeaheadLabel: typeaheadLabel'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  host: {
    class: 'wui-menu-item',
  },
})
export class WuiMenuItem {}
