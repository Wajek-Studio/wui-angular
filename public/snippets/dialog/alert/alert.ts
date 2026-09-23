import { Component, inject } from '@angular/core';
import { WuiButton, WuiDialogService } from '@wajek/wui';
import { HapusDialog } from '../from-component/hapus-dialog';

@Component({
  selector: 'app-dialog-alert-demo',
  imports: [WuiButton],
  templateUrl: './alert.html',
})
export class DialogAlertDemoComponent {
  private readonly dialogs = inject(WuiDialogService);

  bukaAlert(): void {
    // Membuka dialog dengan role="alertdialog" dan disableClose: true
    // ESC dan klik backdrop dimatikan, hanya tombol di dalam dialog yang bisa menutupnya
    void this.dialogs.open<boolean>(HapusDialog, {
      data: { nama: 'Produk C' },
      role: 'alertdialog',
      disableClose: true,
      ariaLabelledBy: 'hapus-dialog-title',
    });
  }
}
