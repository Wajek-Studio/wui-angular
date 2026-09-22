import {
  Overlay,
  OverlayConfig,
  OverlayRef,
  STANDARD_DROPDOWN_ADJACENT_POSITIONS,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Injectable, TemplateRef, ViewContainerRef, inject, signal } from '@angular/core';

/** Varian panel yang diuji di spike F0. */
export type SpikePanelVarian = 'plain' | 'z' | 'flip' | 'flipAtas' | 'bawahFleksibel' | 'atasShrink';

/**
 * Pembuka panel uji untuk spike F0 — **kode sekali pakai**, bukan bagian library.
 *
 * Semuanya memakai `flexibleConnectedTo` + preset dropdown CDK, seperti rencana `wui-select`:
 *
 * - `plain` — apa adanya dari CDK (tanpa `z-index` sendiri), `withPush` + dimensi fleksibel aktif.
 * - `z` — sama + `.spike-pane--z` (`z-index: 1200`, usul `$wui-z-select-panel`).
 * - `flip` — preset CDK `BELOW + ADJACENT`, `withPush` & dimensi fleksibel dimatikan.
 * - `flipAtas` — **hanya** `STANDARD_DROPDOWN_BELOW_POSITIONS`, `withPush` & dimensi fleksibel
 *   dimatikan. Preset itu sudah memuat dua posisi "di atas", jadi inilah cara memberi tahu
 *   CDK: "di bawah kalau cukup, kalau tidak ya di atas" — tanpa opsi ke samping.
 * - `bawahFleksibel` — hanya `BELOW_POSITIONS` **dengan** `withPush` + dimensi fleksibel →
 *   kandidat konfigurasi `wui-select`: tetap di bawah, menyusut, lalu menggulir di dalam panel.
 * - `atasShrink` — hanya `BELOW_POSITIONS`, dimensi fleksibel aktif, `withPush` **mati** →
 *   kandidat "flip ke atas dulu, baru menyusut" tanpa risiko panel kegeser menimpa trigger.
 *
 * Panel dibuat **sekali per kunci** lalu `attach`/`detach` — pola yang direncanakan di
 * `wui-select-plan.md` §3.4, jadi spike ini sekaligus menguji apakah pola itu bekerja.
 */
@Injectable({ providedIn: 'root' })
export class SpikeOverlay {
  readonly #overlay = inject(Overlay);
  readonly #refs = new Map<string, OverlayRef>();

  /** Log hasil ukur; dibaca halaman spike (dan otomasi lewat teks `#spike-log`). */
  readonly log = signal<readonly string[]>([]);

  /** Satu baris hasil ukur. */
  catat(baris: string): void {
    this.log.update((list) => [...list, baris]);
  }

  bersihkan(): void {
    this.log.set([]);
  }

  /** Buka panel untuk `kunci` (dibuat sekali, dipakai ulang) dan kembalikan ref-nya. */
  buka(
    kunci: string,
    origin: HTMLElement,
    isi: TemplateRef<unknown>,
    vcr: ViewContainerRef,
    varian: SpikePanelVarian = 'plain',
  ): OverlayRef {
    this.tutupSelain(kunci);

    let ref = this.#refs.get(kunci);

    if (!ref) {
      ref = this.#overlay.create(this.#config(origin, varian));
      ref.outsidePointerEvents().subscribe(() => ref?.detach());
      this.#refs.set(kunci, ref);
    }

    if (!ref.hasAttached()) {
      ref.attach(new TemplatePortal(isi, vcr));
    }

    return ref;
  }

  tutup(kunci: string): void {
    this.#refs.get(kunci)?.detach();
  }

  tutupSemua(): void {
    for (const ref of this.#refs.values()) {
      ref.detach();
    }
  }

  private tutupSelain(kunci: string): void {
    for (const [k, ref] of this.#refs) {
      if (k !== kunci) {
        ref.detach();
      }
    }
  }

  #config(origin: HTMLElement, varian: SpikePanelVarian): OverlayConfig {
    const fleksibel = varian !== 'flip' && varian !== 'flipAtas';
    const dorong = fleksibel && varian !== 'atasShrink';
    const hanyaBawah = varian === 'flipAtas' || varian === 'bawahFleksibel' || varian === 'atasShrink';
    const posisi = this.#overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(
        hanyaBawah
          ? STANDARD_DROPDOWN_BELOW_POSITIONS
          : [...STANDARD_DROPDOWN_BELOW_POSITIONS, ...STANDARD_DROPDOWN_ADJACENT_POSITIONS],
      )
      .withViewportMargin(8)
      .withPush(dorong)
      .withFlexibleDimensions(fleksibel)
      .withGrowAfterOpen(false);

    return {
      positionStrategy: posisi,
      scrollStrategy: this.#overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      panelClass: ['spike-pane', varian === 'z' ? 'spike-pane--z' : 'spike-pane--plain'],
    };
  }
}
