import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiButton, WuiDialogRef, WuiDialogService, WuiPage, WuiPageService, WuiPageContent, WuiScrollbar } from '@wajek/wui';
import { firstValueFrom } from 'rxjs';
import { ShowcaseComponent, ShowcaseTab } from '../../../shared/showcase';
import { HapusDialog } from '../hapus-dialog/hapus-dialog';

export interface DialogSnippet {
  html?: string;
  ts?: string;
  dialogTs?: string;
}

/**
 * Halaman demo `WuiDialogService`.
 *
 * Tiga cara membuka dialog diperagakan: dari komponen, dari `<ng-template>`, dan sebagai alert
 * (`role="alertdialog"` + `disableClose`). Hasilnya (`ref.result`) ditampilkan di halaman supaya
 * nilai yang dikirim `close(result)` kelihatan.
 */
@Component({
  selector: 'app-dialog.page',
  imports: [RouterLink, WuiButton, WuiPage, ShowcaseComponent, WuiPageContent, WuiScrollbar],
  templateUrl: './dialog.page.html',
  styleUrl: './dialog.page.scss',
})
export class DialogPage implements OnInit {
  private readonly http = inject(HttpClient);
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

  // Snippets
  readonly fromComponentSnippet = signal<DialogSnippet>({});
  readonly fromTemplateSnippet = signal<DialogSnippet>({});
  readonly alertRoleSnippet = signal<DialogSnippet>({});
  readonly alertSnippet = signal<DialogSnippet>({});

  // Dynamic Tabs for ShowcaseComponent
  readonly fromComponentTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.fromComponentSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.fromComponentSnippet().ts ?? '', language: 'typescript' },
    { label: 'Komponen Dialog (HapusDialog)', code: this.fromComponentSnippet().dialogTs ?? '', language: 'typescript' },
  ]);

  readonly fromTemplateTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.fromTemplateSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.fromTemplateSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly alertRoleTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.alertRoleSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.alertRoleSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly alertTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.alertSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.alertSnippet().ts ?? '', language: 'typescript' },
  ]);

  async ngOnInit(): Promise<void> {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });

    // Load snippet dialog secara paralel
    const [fromComp, fromTpl, alertRole, alertSys] = await Promise.all([
      this.loadComponentSnippet(),
      this.loadTemplateSnippet(),
      this.loadAlertRoleSnippet(),
      this.loadAlertSnippet(),
    ]);

    this.fromComponentSnippet.set(fromComp);
    this.fromTemplateSnippet.set(fromTpl);
    this.alertRoleSnippet.set(alertRole);
    this.alertSnippet.set(alertSys);
  }

  private async loadComponentSnippet(): Promise<DialogSnippet> {
    try {
      const [html, ts, dialogTs] = await Promise.all([
        firstValueFrom(this.http.get('snippets/dialog/from-component/from-component.html', { responseType: 'text' })).catch(() => ''),
        firstValueFrom(this.http.get('snippets/dialog/from-component/from-component.ts', { responseType: 'text' })).catch(() => ''),
        firstValueFrom(this.http.get('snippets/dialog/from-component/hapus-dialog.ts', { responseType: 'text' })).catch(() => ''),
      ]);
      return { html, ts, dialogTs };
    } catch {
      return {};
    }
  }

  private async loadTemplateSnippet(): Promise<DialogSnippet> {
    try {
      const [html, ts] = await Promise.all([
        firstValueFrom(this.http.get('snippets/dialog/from-template/from-template.html', { responseType: 'text' })).catch(() => ''),
        firstValueFrom(this.http.get('snippets/dialog/from-template/from-template.ts', { responseType: 'text' })).catch(() => ''),
      ]);
      return { html, ts };
    } catch {
      return {};
    }
  }

  private async loadAlertRoleSnippet(): Promise<DialogSnippet> {
    try {
      const [html, ts] = await Promise.all([
        firstValueFrom(this.http.get('snippets/dialog/alert/alert.html', { responseType: 'text' })).catch(() => ''),
        firstValueFrom(this.http.get('snippets/dialog/alert/alert.ts', { responseType: 'text' })).catch(() => ''),
      ]);
      return { html, ts };
    } catch {
      return {};
    }
  }

  private async loadAlertSnippet(): Promise<DialogSnippet> {
    try {
      const [html, ts] = await Promise.all([
        firstValueFrom(this.http.get('snippets/dialog/alert-system/alert-system.html', { responseType: 'text' })).catch(() => ''),
        firstValueFrom(this.http.get('snippets/dialog/alert-system/alert-system.ts', { responseType: 'text' })).catch(() => ''),
      ]);
      return { html, ts };
    } catch {
      return {};
    }
  }

  /** Dialog dari komponen: ref-nya di-inject oleh komponen dialognya sendiri. */
  protected async bukaKomponen(): Promise<void> {
    const ref = this.dialogs.open<boolean>(HapusDialog, {
      data: { nama: 'Produk A' },
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

  /** Alert: `role="alertdialog"` + `disableClose`. */
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

  private labelAlert(pilihan: number | null): string {
    return pilihan === null ? 'null (ditutup)' : `index ${pilihan}`;
  }
}
