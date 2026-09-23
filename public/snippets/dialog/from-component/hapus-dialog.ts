import { Component, inject } from '@angular/core';
import { WuiButton, WuiDialogRef, injectDialogData } from '@wajek/wui';

@Component({
  selector: 'app-hapus-dialog',
  imports: [WuiButton],
  template: `
    <h2 class="wui-title-medium" id="hapus-dialog-title">Hapus {{ data.nama }}?</h2>
    <p class="wui-body-medium">Tindakan ini tidak dapat dibatalkan.</p>
    <div class="demo-actions" style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem;">
      <button wuiButton variant="text" (click)="batal()">Batal</button>
      <button wuiButton color="error" (click)="hapus()">Hapus</button>
    </div>
  `,
})
export class HapusDialog {
  // Injeksi data yang dikirim oleh pemanggil
  protected readonly data = injectDialogData<{ nama: string }>();

  // Injeksi reference dialog untuk menutup dan mengirim nilai kembali
  private readonly ref = inject<WuiDialogRef<boolean>>(WuiDialogRef);

  protected batal(): void {
    this.ref.close(false);
  }

  protected hapus(): void {
    this.ref.close(true);
  }
}
