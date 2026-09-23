import { Component, inject } from '@angular/core';
import { WuiButton, WuiDialogService } from '@wajek/wui';

@Component({
  selector: 'app-dialog-alert-demo',
  imports: [WuiButton],
  templateUrl: './alert-system.html',
})
export class DialogAlertDemoComponent {
  private readonly dialogs = inject(WuiDialogService);

  hasilAlert = '(belum dibuka)';

  async alertError(): Promise<void> {
    const pilihan = await this.dialogs.alert({
      title: 'Gagal memuat kontak',
      content: 'Server tidak merespons.\nTidak ada data yang berubah.',
    });
    this.hasilAlert = pilihan === null ? 'null (ditutup)' : `index ${pilihan}`;
  }

  async alertRetry(): Promise<void> {
    const pilihan = await this.dialogs.alert({
      title: 'Gagal menyimpan kontak',
      content: 'Permintaan ditolak server dengan HTTP 500. Coba lagi?',
      buttons: ['Tutup', { label: 'Coba lagi', variant: 'filled', color: 'primary' }],
    });
    this.hasilAlert = pilihan === null ? 'null (ditutup)' : `index ${pilihan}`;
  }

  async alertWajib(): Promise<void> {
    const pilihan = await this.dialogs.alert({
      title: 'Sesi berakhir',
      content: 'Masuk kembali untuk melanjutkan.',
      buttons: [{ label: 'Masuk', variant: 'filled', color: 'primary' }],
      dismissible: false, // Mematikan ESC dan klik backdrop
    });
    this.hasilAlert = pilihan === null ? 'null (ditutup)' : `index ${pilihan}`;
  }
}
