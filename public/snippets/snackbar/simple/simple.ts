import { Component, inject } from '@angular/core';
import { WuiButton, WuiSnackbarRef, WuiSnackbarService } from '@wajek/wui';

@Component({
  selector: 'app-snackbar-simple',
  imports: [WuiButton],
  templateUrl: './simple.html',
})
export class SnackbarSimpleComponent {
  private readonly snackbar = inject(WuiSnackbarService);
  private snackbarRef?: WuiSnackbarRef;

  tampilkanSnackbar(): void {
    // Parameter 1: Pesan teks
    // Parameter 2 (opsional): Durasi dalam milidetik (default: 3000ms, atau 0 untuk persistent)
    this.snackbarRef = this.snackbar.open('Data berhasil disimpan!', 3000);

    // Mendengarkan event saat snackbar selesai ditutup
    this.snackbarRef.afterDismissed.subscribe(() => {
      console.log('Snackbar telah ditutup.');
    });
  }

  tutupSnackbar(): void {
    // Menutup instance via service langsung atau lewat ref.dismiss()
    this.snackbar.close();
    // atau: this.snackbarRef?.dismiss();
  }
}
