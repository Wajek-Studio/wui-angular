import { Component, inject } from '@angular/core';
import { WuiButton, WuiDialogService } from '@wajek/wui';
import { HapusDialog } from './hapus-dialog';

@Component({
  selector: 'app-dialog-demo',
  imports: [WuiButton],
  templateUrl: './from-component.html',
})
export class DialogDemoComponent {
  private readonly dialogs = inject(WuiDialogService);

  hasilKomponen = '(belum dibuka)';

  async bukaKomponen(): Promise<void> {
    // Membuka komponen dialog dengan mengirim data input
    const ref = this.dialogs.open<boolean>(HapusDialog, {
      data: { nama: 'Produk A' },
      ariaLabelledBy: 'hapus-dialog-title',
    });

    // Menunggu hasil kembalian dialog secara asynchronous
    const hasil = await ref.result;
    this.hasilKomponen = hasil === undefined ? 'ditutup tanpa jawaban' : String(hasil);
  }
}
