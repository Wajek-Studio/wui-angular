import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
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
import { firstValueFrom } from 'rxjs';
import { ShowcaseComponent, ShowcaseTab } from '../../../shared/showcase';

interface Baris {
  id: number;
  nama: string;
}

export interface ContextMenuSnippet {
  html?: string;
  ts?: string;
}

/**
 * Halaman demo menu konteks (`[wuiContextMenu]` + `<wui-menu>`).
 *
 * Menggunakan ShowcaseComponent untuk menyajikan live interactive preview dan tab kode sumber HTML dan TypeScript.
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
    ShowcaseComponent,
  ],
  templateUrl: './context-menu.page.html',
})
export class ContextMenuPage implements OnInit {
  private readonly http = inject(HttpClient);
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

  // Snippets
  readonly buttonTriggerSnippet = signal<ContextMenuSnippet>({});
  readonly withDataSnippet = signal<ContextMenuSnippet>({});
  readonly inDialogSnippet = signal<ContextMenuSnippet>({});

  // Dynamic Tabs for ShowcaseComponent
  readonly buttonTriggerTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.buttonTriggerSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.buttonTriggerSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly withDataTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.withDataSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.withDataSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly inDialogTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.inDialogSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.inDialogSnippet().ts ?? '', language: 'typescript' },
  ]);

  async ngOnInit(): Promise<void> {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });

    // Load snippet secara paralel dari public/snippets/context-menu/
    const [buttonTrigger, withData, inDialog] = await Promise.all([
      this.fetchSnippet('button-trigger'),
      this.fetchSnippet('with-data'),
      this.fetchSnippet('in-dialog'),
    ]);

    this.buttonTriggerSnippet.set(buttonTrigger);
    this.withDataSnippet.set(withData);
    this.inDialogSnippet.set(inDialog);
  }

  private async fetchSnippet(name: string): Promise<ContextMenuSnippet> {
    try {
      const [html, ts] = await Promise.all([
        firstValueFrom(this.http.get(`snippets/context-menu/${name}/${name}.html`, { responseType: 'text' })).catch(() => ''),
        firstValueFrom(this.http.get(`snippets/context-menu/${name}/${name}.ts`, { responseType: 'text' })).catch(() => ''),
      ]);
      return { html, ts };
    } catch {
      return {};
    }
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
