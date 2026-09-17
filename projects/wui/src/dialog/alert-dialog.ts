import { Component, inject } from '@angular/core';
import type { SafeHtml } from '@angular/platform-browser';

import { WuiButton } from '../button/button';
import { injectDialogData, WuiAlertButton } from './dialog.options';
import { WuiDialogRef } from './dialog.ref';

/**
 * Data yang dikirim `WuiDialogService.alert()` ke isi dialog sistem.
 * @internal bentuknya sudah dinormalisasi service (label `string` sudah jadi objek).
 */
export interface WuiAlertDialogData {
  readonly title: string;
  readonly titleId: string;
  readonly content: string | SafeHtml | null;
  readonly contentId: string | null;
  readonly buttons: readonly WuiAlertButton[];
}

/**
 * Isi dialog sistem — dipakai **hanya** oleh `WuiDialogService.alert()`.
 *
 * Tidak diekspor dari public API: aplikasi tidak pernah menyentuh komponen ini, cukup memanggil
 * `alert()` dengan data. Karena isinya data-driven, tidak perlu template per komponen di aplikasi.
 *
 * @internal
 */
@Component({
  selector: 'wui-alert-dialog',
  imports: [WuiButton],
  templateUrl: './alert-dialog.html',
})
export class WuiAlertDialog {
  protected readonly data = injectDialogData<WuiAlertDialogData>();

  private readonly ref = inject<WuiDialogRef<number>>(WuiDialogRef);

  /** Hasil dialog = index tombol, sesuai urutan di `buttons`. */
  protected pilih(index: number): void {
    this.ref.close(index);
  }
}
