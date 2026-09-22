import { ChangeDetectionStrategy, Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { WuiButton, WuiDialogRef } from '@wajek/wui';

import { SpikeOverlay, SpikePanelVarian } from './spike-overlay';
import { activeDesc, hitPada, panelDari, rect, urutanContainer, zIndexOf } from './spike-ukur';

/**
 * Dialog uji spike F0 — **kode sekali pakai**.
 *
 * Isinya dua tombol yang membuka panel dari dalam dialog. Bedanya hanya `z-index` pane, jadi
 * perbandingannya adil: konteks (dialog, backdrop, trigger di dalam pane dialog) sama.
 */
@Component({
  selector: 'app-spike-dialog',
  imports: [WuiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 id="spike-dialog-title" class="wui-title-large wui-mb-2">Panel di dalam dialog</h2>
    <p class="wui-body-medium wui-mb-3">
      Dialog memakai <code>--wui-z-dialog: 1100</code>. Tombol "plain" memakai apa adanya dari CDK,
      tombol "z" menambahkan <code>z-index: 1200</code>. Baris <code>hit</code> di log halaman yang
      menjawab: apakah panel benar-benar menerima klik di dalam dialog?
    </p>

    <div class="spike-baris wui-mb-3">
      <button wuiButton variant="outlined" data-spike="c-plain" (click)="buka($event, 'plain')">
        Panel plain (apa adanya CDK)
      </button>
      <button wuiButton variant="outlined" data-spike="c-z" (click)="buka($event, 'z')">
        Panel + z-index 1200
      </button>
    </div>

    <div class="spike-baris">
      <button wuiButton variant="text" data-spike="c-tutup" (click)="tutup()">Tutup dialog</button>
    </div>

    <ng-template #panelDialog>
      <div class="spike-isi">
        @for (item of opsi; track item) {
          <div class="spike-item">{{ item }}</div>
        }
      </div>
    </ng-template>
  `,
})
export class SpikeDialog {
  private readonly ref = inject(WuiDialogRef);
  private readonly vcr = inject(ViewContainerRef);

  protected readonly spike = inject(SpikeOverlay);
  protected readonly opsi = ['Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam'];

  private readonly tplPanel = viewChild.required<TemplateRef<unknown>>('panelDialog');

  protected buka(ev: Event, varian: SpikePanelVarian): void {
    const origin = ev.currentTarget as HTMLElement;
    const ref = this.spike.buka(`c-${varian}`, origin, this.tplPanel(), this.vcr, varian);
    const panel = panelDari(ref);

    if (!panel) {
      this.spike.catat(`[C/${varian}] panel tidak ditemukan`);
      return;
    }

    this.spike.catat(`[C/${varian}] fokus=${activeDesc()} (geometri diukur setelah layout selesai)`);

    setTimeout(() => {
      const pane = ref.overlayElement;
      const paneDialog = document.querySelector<HTMLElement>('.cdk-overlay-pane.wui-dialog');

      this.spike.catat(
        `[C/${varian} +250ms] pane z=${zIndexOf(pane)} · dialog-pane z=${zIndexOf(paneDialog)} · ` +
          `panel ${rect(panel)} · hit-atas=${hitPada(panel, 0.5, 0.05)} · hit-tengah=${hitPada(panel, 0.5, 0.5)} · ` +
          `${urutanContainer(pane, paneDialog)} · fokus=${activeDesc()}`,
      );
    }, 250);
  }

  protected tutup(): void {
    this.ref.close();
  }
}
