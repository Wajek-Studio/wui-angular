import { Component, viewChild, ViewContainerRef } from '@angular/core';

/**
 * Pembungkus satu layer page.
 *
 * Komponen ini ada supaya template page punya `ViewContainerRef` yang hidup **di dalam**
 * `.wui-page--layer`. Sebelumnya `[wuiPageHost]` memakai container milik elemen host lalu
 * memindahkan node hasilnya ke pembungkus — dan pemindahan itu merusak hidrasi SSR, karena Angular
 * mencocokkan sebuah container dengan dehydrated view-nya lewat `nextSibling` pada posisi container.
 *
 * `#slot` berupa `<ng-template>` supaya tidak ada node perantara di DOM: `LContainer` milik
 * template tetap terbaca sebagai `ViewContainerRef`, jadi embedded view page disisipkan langsung
 * sebagai anak `.wui-page--layer` (DOM bersih: `.wui-page--layer > .wui-page`).
 */
@Component({
  selector: 'wui-page-layer',
  host: { class: 'wui-page--layer' },
  template: `<ng-container #slot />`,
})
export class WuiPageLayer {
  readonly slot = viewChild.required('slot', { read: ViewContainerRef });
}
