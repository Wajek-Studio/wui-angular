import { Component, inject } from '@angular/core';
import { WuiButton, WuiDialogRef, injectDialogData } from '@wajek/wui';

/**
 * Isi dialog contoh — dibuka lewat `WuiDialogService.open(HapusDialog, { data })`.
 *
 * Dua hal yang didapat dari injeksi:
 * - `injectDialogData()` → nilai `options.data`
 * - `inject(WuiDialogRef)` → handle untuk menutup sambil mengirim hasil
 */
@Component({
  selector: 'app-hapus-dialog',
  imports: [WuiButton],
  templateUrl: './hapus-dialog.html',
  styleUrl: './hapus-dialog.scss',
})
export class HapusDialog {
  protected readonly data = injectDialogData<{ nama: string }>();

  private readonly ref = inject<WuiDialogRef<boolean>>(WuiDialogRef);

  protected batal(): void {
    this.ref.close(false);
  }

  protected hapus(): void {
    this.ref.close(true);
  }
}
