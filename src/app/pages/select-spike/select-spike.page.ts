import { OverlayRef } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { WuiButton, WuiDialogService, WuiPage, WuiPageService } from '@wajek/wui';

import { SpikeDialog } from './spike-dialog';
import { SpikeOverlay, SpikePanelVarian } from './spike-overlay';
import { activeDesc, diContainerCdk, hitPada, panelDari, rect } from './spike-ukur';

/**
 * Halaman spike **F0** untuk rencana `wui-select` — kode sekali pakai, bukan bagian library.
 *
 * Empat kasus yang diukur (rencana §9):
 *
 * 1. panel dibuka dari dalam induk `overflow: hidden` — apakah lolos atau terpotong;
 * 2. panel dibuka dari dalam **lapisan page kedua** (focus trap menyala);
 * 3. panel dibuka dari dalam **dialog** — `plain` vs `z-index: 1200` (usul `$wui-z-select-panel`);
 * 4. **flip** saat ruang bawah jendela tidak cukup.
 *
 * Semua hasil masuk ke log di halaman (`#spike-log`) supaya bisa dibaca manual maupun otomasi.
 * Gaya komponen ini `ViewEncapsulation.None` karena pane overlay hidup di `document.body`,
 * bukan di dalam komponen.
 */
@Component({
  selector: 'app-select-spike',
  imports: [WuiButton, WuiPage],
  templateUrl: './select-spike.page.html',
  styleUrl: './select-spike.page.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSpikePage {
  private readonly halaman = inject(WuiPageService);
  private readonly dialogs = inject(WuiDialogService);
  private readonly vcr = inject(ViewContainerRef);

  protected readonly spike = inject(SpikeOverlay);
  protected readonly opsi = ['Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan'];

  private readonly tplHalaman = viewChild.required<TemplateRef<unknown>>('halaman');
  private readonly tplLapisan = viewChild.required<TemplateRef<unknown>>('lapisan');
  private readonly tplPanel = viewChild.required<TemplateRef<unknown>>('panel');

  protected readonly logTeks = computed(() => this.spike.log().join('\n') || '(belum ada pengukuran)');

  constructor() {
    afterNextRender(() => {
      this.halaman.replace(this.tplHalaman(), { variant: 'full' });
      this.spike.catat(`[env] jendela ${window.innerWidth}×${window.innerHeight}`);
    });
  }

  /** Kasus 1 — panel dibuka dari tombol di dalam kotak `overflow: hidden`. */
  protected bukaDalamKotak(ev: Event): void {
    const origin = ev.currentTarget as HTMLElement;
    const kotak = origin.closest<HTMLElement>('.spike-clip');
    const ref = this.spike.buka('a', origin, this.tplPanel(), this.vcr, 'plain');
    const panel = panelDari(ref);

    if (!panel) {
      this.spike.catat('[A] panel tidak ditemukan');
      return;
    }

    // Ukuran di tick yang sama dengan `attach()` memang belum siap (pane masih 1×1 di 0,0) —
    // itu sendiri temuan yang dicatat, lalu diukur ulang setelah layout selesai.
    this.spike.catat(
      `[A] segera setelah attach: pane ${rect(ref.overlayElement)} · panel ${rect(panel)} · ` +
        `di container CDK? ${diContainerCdk(ref.overlayElement)} (geometri belum dihitung)`,
    );

    setTimeout(() => this.#barisPanel('A +250ms', ref, panel, kotak), 250);
  }

  /** Kasus 2 — tumpuk lapisan page kedua (trap lapisan itu menyala). */
  protected bukaLapisan(): void {
    this.halaman.push(this.tplLapisan(), { variant: 'full' });
    this.spike.catat(`[B] lapisan kedua dibuka · depth=${this.halaman.depth()} · fokus=${activeDesc()}`);
  }

  protected tutupLapisan(): void {
    this.halaman.closeTop();
    this.spike.catat(`[B] lapisan kedua ditutup · depth=${this.halaman.depth()} · fokus=${activeDesc()}`);
  }

  /** Kasus 2 — panel dibuka dari dalam lapisan yang trap-nya menyala. */
  protected bukaDalamLapisan(ev: Event): void {
    const origin = ev.currentTarget as HTMLElement;
    const sebelum = activeDesc();
    const ref = this.spike.buka('b', origin, this.tplPanel(), this.vcr, 'plain');
    const panel = panelDari(ref);

    if (!panel) {
      this.spike.catat('[B] panel tidak ditemukan');
      return;
    }

    this.spike.catat(`[B] fokus sebelum=${sebelum} → sesudah=${activeDesc()}`);

    setTimeout(() => {
      this.#barisPanel('B +250ms', ref, panel);
      this.spike.catat(`[B +250ms] fokus=${activeDesc()}`);
    }, 250);
  }

  /** Kasus 3 — dialog berisi dua varian panel. */
  protected bukaDialog(): void {
    this.spike.catat('[C] dialog dibuka');

    void this.dialogs
      .open<boolean>(SpikeDialog, { ariaLabelledBy: 'spike-dialog-title' })
      .result.then(() => this.spike.catat('[C] dialog ditutup'));
  }

  /** Kasus 4 — apa yang terjadi saat ruang bawah jendela tidak cukup. */
  protected bukaFlip(ev: Event, varian: SpikePanelVarian, kunci: string, label: string): void {
    const origin = ev.currentTarget as HTMLElement;
    const ref = this.spike.buka(kunci, origin, this.tplPanel(), this.vcr, varian);
    const panel = panelDari(ref);

    if (!panel) {
      this.spike.catat(`[${label}] panel tidak ditemukan`);
      return;
    }

    setTimeout(() => {
      const ro = origin.getBoundingClientRect();
      const rp = panel.getBoundingClientRect();

      this.spike.catat(
        `[${label} +250ms] jendela h=${window.innerHeight} · tombol ${rect(origin)} (bawah ${Math.round(ro.bottom)}) · ` +
          `panel ${rect(panel)} · flip ke atas? ${rp.bottom <= ro.top + 1} · di samping? ${rp.left >= ro.right - 1 || rp.right <= ro.left + 1} · ` +
          `utuh di jendela? ${rp.top >= 0 && rp.bottom <= window.innerHeight} · sisa bawah ${Math.round(window.innerHeight - rp.bottom)}px · tinggi panel ${Math.round(rp.height)}px · hit-tengah=${hitPada(panel, 0.5, 0.5)}`,
      );
    }, 250);
  }

  /** Satu baris ukur geometri panel + hit-test; `kotak` menguji apakah panel lolos dari induk. */
  #barisPanel(label: string, ref: OverlayRef, panel: HTMLElement, kotak: HTMLElement | null = null): void {
    const rp = panel.getBoundingClientRect();
    const bagian = [`pane ${rect(ref.overlayElement)}`, `panel ${rect(panel)}`];

    if (kotak) {
      const rk = kotak.getBoundingClientRect();

      bagian.push(`kotak ${rect(kotak)} (overflow: hidden)`);
      bagian.push(`melewati garis bawah kotak? ${rp.bottom > rk.bottom}`);
    }

    bagian.push(`hit-atas=${hitPada(panel, 0.5, 0.05)}`);
    bagian.push(`hit-bawah=${hitPada(panel, 0.5, 0.95)}`);
    this.spike.catat(`[${label}] ${bagian.join(' · ')}`);
  }
}
