import { Component, OnInit, TemplateRef, inject, signal, viewChild } from '@angular/core';
import {
  WuiButton,
  WuiContextMenuTrigger,
  WuiDialogService,
  WuiIcon,
  WuiMenu,
  WuiMenuDivider,
  WuiMenuItem,
  WuiPage,
  WuiPageService,
  WuiTable,
  WuiTableResponsive,
} from '@wajek/wui';

interface Baris {
  id: number;
  nama: string;
}

/**
 * Halaman demo menu konteks (`[wuiContextMenu]` + `<wui-menu>`).
 *
 * Fase **F1**: kerangkanya — menu terbuka di titik penunjuk, permukaan `wui-*`, dan perilaku panel
 * yang meniru `<wui-select>` (backdrop transparan: klik & gulir di belakang tertahan, `Escape`
 * menutup satu tingkat). Navigasi keyboard, `Tab`, dan pemulihan fokus diperiksa di F2 — lihat
 * `docs/planning/wui-context-menu-plan.md` §7.
 */
@Component({
  selector: 'app-context-menu.page',
  imports: [
    WuiButton,
    WuiContextMenuTrigger,
    WuiIcon,
    WuiMenu,
    WuiMenuDivider,
    WuiMenuItem,
    WuiPage,
    WuiTable,
    WuiTableResponsive,
  ],
  templateUrl: './context-menu.page.html',
})
export class ContextMenuPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);
  private readonly dialogs: WuiDialogService = inject(WuiDialogService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');
  readonly dialogTpl = viewChild<TemplateRef<unknown>>('dialog');

  protected readonly baris = signal<Baris[]>([
    { id: 1, nama: 'Berkas A' },
    { id: 2, nama: 'Berkas B' },
    { id: 3, nama: 'Berkas C' },
  ]);

  /** Jejak aksi terakhir — supaya klik item menu kelihatan hasilnya. */
  protected readonly aksiTerakhir = signal('(belum ada aksi)');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }

  protected aksi(nama: string, data?: Baris): void {
    this.aksiTerakhir.set(data ? `${nama} · ${data.nama}` : nama);
  }

  /** Membuka menu dari kode, di titik klik — jalur `buka(x, y)` milik pemicunya. */
  protected bukaTerprogram(event: MouseEvent, pemicu: WuiContextMenuTrigger): void {
    pemicu.buka(event.clientX, event.clientY);
  }

  protected bukaDialog(): void {
    this.dialogs.openTemplate(this.dialogTpl()!, {});
  }
}
