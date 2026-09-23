import { MENU_SCROLL_STRATEGY } from '@angular/cdk/menu';
import { Overlay } from '@angular/cdk/overlay';
import { Directive, inject } from '@angular/core';

/**
 * Harness F0 — **kode sekali pakai**.
 *
 * Menimpa strategi gulir menu jadi `block()` (keputusan N5) di elemen pemicunya.
 *
 * Hasil F0: **`block()` tidak berefek** di layout aplikasi ini — bukan karena placement provider,
 * tapi karena `BlockScrollStrategy._canBeEnabled()` (`@angular/cdk/fesm2022/overlay-module.mjs:89-101`)
 * mensyaratkan **`<html>` sendiri yang menggulir**, sedangkan di aplikasi ini yang menggulir adalah
 * `.wui-page-content` di dalam lapisan page. Terukur: tidak ada kelas `cdk-global-scrollblock` dan
 * halaman tetap bergulir 832 → 1232 selagi menu terbuka. Directive ini tetap dipertahankan supaya
 * jalur "provider di elemen pemicu" bisa dipakai lagi saat keputusan §6 no. 1 diambil.
 */
@Directive({
  selector: '[spikeBlok]',
  providers: [
    {
      provide: MENU_SCROLL_STRATEGY,
      useFactory: () => {
        const overlay = inject(Overlay);

        return () => overlay.scrollStrategies.block();
      },
    },
  ],
})
export class SpikeBlok {}
