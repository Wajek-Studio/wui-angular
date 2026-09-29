import { Component, inject } from '@angular/core';
import { WuiButton, WuiSnackbarService } from '@wajek/wui';

@Component({
  selector: 'snackbar-basic-example',
  standalone: true,
  imports: [WuiButton],
  templateUrl: './snackbar-basic-example.html'
})
export class SnackbarBasicExample {
  private readonly snackbarService = inject(WuiSnackbarService);

  showBasic(): void {
    this.snackbarService.open('Perubahan data berhasil disimpan.', 3000);
  }

  closeSnackbar(): void {
    this.snackbarService.close();
  }
}
