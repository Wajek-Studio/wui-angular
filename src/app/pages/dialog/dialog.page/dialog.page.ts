import { Component, OnInit, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiButton, WuiDialogRef, WuiDialogService, WuiPage, WuiPageService } from '@wajek/wui';

import { HapusDialog } from '../hapus-dialog/hapus-dialog';

/**
 * Halaman demo `WuiDialogService`.
 *
 * Tiga cara membuka dialog diperagakan: dari komponen, dari `<ng-template>`, dan sebagai alert
 * (`role="alertdialog"` + `disableClose`). Hasilnya (`ref.result`) ditampilkan di halaman supaya
 * nilai yang dikirim `close(result)` kelihatan.
 */
@Component({
  selector: 'app-dialog.page',
  imports: [RouterLink, WuiButton, WuiPage],
  templateUrl: './dialog.page.html',
  styleUrl: './dialog.page.scss',
})
export class DialogPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);
  protected readonly dialogs: WuiDialogService = inject(WuiDialogService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  /** Template isi dialog — `<ng-template>` harus tinggal di template komponen pemakainya. */
  private readonly tplDialog = viewChild<TemplateRef<{ nama: string }>>('tplDialog');

  protected readonly hasilKomponen = signal('(belum dibuka)');
  protected readonly hasilTemplate = signal('(belum dibuka)');
  protected readonly hasilAlert = signal('(belum dibuka)');

  /** Ref dialog template — tidak ada komponen pemilik, jadi ref-nya dipegang halaman. */
  private templateRef: WuiDialogRef<string> | null = null;

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }

  /** Dialog dari komponen: ref-nya di-inject oleh komponen dialognya sendiri. */
  protected async bukaKomponen(): Promise<void> {
    const ref = this.dialogs.open<boolean>(HapusDialog, {
      data: { nama: 'Produk A' },
      // Label untuk screen reader — mengarah ke `<h2 id="hapus-dialog-title">` di isi dialog.
      ariaLabelledBy: 'hapus-dialog-title',
    });

    const hasil = await ref.result;
    this.hasilKomponen.set(hasil === undefined ? 'ditutup tanpa jawaban' : String(hasil));
  }

  /** Dialog dari `<ng-template>`: konteksnya tersedia sebagai `let-data` di template. */
  protected bukaTemplate(): void {
    this.templateRef = this.dialogs.openTemplate<string, { nama: string }>(this.tplDialog()!, {
      data: { nama: 'Produk B' },
      ariaLabelledBy: 'demo-template-title',
    });

    void this.templateRef.result.then((hasil) => {
      this.hasilTemplate.set(hasil ?? 'ditutup tanpa pilihan');
    });
  }

  protected tutupTemplate(nilai: string): void {
    this.templateRef?.close(nilai);
  }

  /**
   * Alert: `role="alertdialog"` + `disableClose`.
   *
   * `disableClose` mematikan ESC dan klik backdrop, jadi satu-satunya jalan keluar adalah tombol
   * di dalam dialog — perilaku yang diharapkan untuk dialog sistem.
   */
  protected bukaAlert(): void {
    void this.dialogs
      .open<boolean>(HapusDialog, {
        data: { nama: 'Produk C' },
        role: 'alertdialog',
        disableClose: true,
        ariaLabelledBy: 'hapus-dialog-title',
      })
      .result.then((hasil) => {
        this.hasilKomponen.set(`alert → ${hasil ?? 'ditutup tanpa jawaban'}`);
      });
  }

  /** Dialog sistem dengan satu tombol — kasus paling sering untuk pesan error API. */
  protected async alertError(): Promise<void> {
    const pilihan = await this.dialogs.alert({
      title: 'Gagal memuat kontak',
      // `\n` dipertahankan (`white-space: pre-line` di isi dialog), jadi teks biasa tidak perlu HTML.
      content: 'Server tidak merespons.\nTidak ada data yang berubah.',
    });

    this.hasilAlert.set(this.labelAlert(pilihan));
  }

  /** Tombol sebagai objek — aksi utama dibedakan tanpa perlu template sendiri. */
  protected async alertRetry(): Promise<void> {
    const pilihan = await this.dialogs.alert({
      title: 'Gagal menyimpan kontak',
      content: 'Permintaan ditolak server dengan <code>HTTP 500</code>. Coba lagi?',
      buttons: ['Tutup', { label: 'Coba lagi', variant: 'filled', color: 'primary' }],
    });

    this.hasilAlert.set(this.labelAlert(pilihan));
  }

  /** `dismissible: false` — ESC & klik backdrop dimatikan, wajib memilih tombol. */
  protected async alertWajib(): Promise<void> {
    const pilihan = await this.dialogs.alert({
      title: 'Sesi berakhir',
      content: 'Masuk kembali untuk melanjutkan.',
      buttons: [{ label: 'Masuk', variant: 'filled', color: 'primary' }],
      dismissible: false,
    });

    this.hasilAlert.set(this.labelAlert(pilihan));
  }

  /** `null` berarti ditutup tanpa memilih tombol (ESC / klik backdrop). */
  private labelAlert(pilihan: number | null): string {
    return pilihan === null ? 'null (ditutup)' : `index ${pilihan}`;
  }
}
