import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  WuiButton,
  WuiFormField,
  WuiInput,
  WuiLabel,
  WuiPage,
  WuiPageService,
  WuiSnackbarRef,
  WuiSnackbarService,
} from '@wajek/wui';
import { Highlight } from 'ngx-highlightjs';
import { firstValueFrom } from 'rxjs';

export interface ActivityLog {
  time: string;
  message: string;
}

export interface ExampleScript {
  ts?: string;
  html?: string;
}

@Component({
  selector: 'app-snackbar-page',
  templateUrl: './snackbar.page.html',
  styleUrl: './snackbar.page.scss',
  imports: [
    RouterLink,
    FormsModule,
    WuiPage,
    WuiButton,
    WuiFormField,
    WuiInput,
    WuiLabel,
    Highlight,
  ],
})
export class SnackbarPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly pageService = inject(WuiPageService);
  private readonly snackbarService = inject(WuiSnackbarService);

  readonly pageTpl = viewChild.required<TemplateRef<unknown>>('pageTpl');

  // State Playground
  readonly customMessage = signal('Perubahan data berhasil disimpan.');
  readonly selectedDuration = signal<number>(3000);
  readonly isActive = signal(false);
  readonly logs = signal<ActivityLog[]>([]);

  // State Code Viewer
  readonly activeTab = signal<'html' | 'ts'>('html');
  readonly showCode = signal(true);
  readonly simpleSnippet = signal<ExampleScript>({});

  private currentRef?: WuiSnackbarRef;

  async ngOnInit(): Promise<void> {
    this.pageService.replace(this.pageTpl(), { variant: 'full' });

    // Load snippet dari folder public/snippets/snackbar/
    const snippet = await this.fetchSnippet('simple', 'simple');
    this.simpleSnippet.set(snippet);
  }

  private async fetchSnippet(dir: string, file: string): Promise<ExampleScript> {
    try {
      const [ts, html] = await Promise.all([
        firstValueFrom(
          this.http.get(`snippets/snackbar/${dir}/${file}.ts`, { responseType: 'text' }),
        ).catch(() => '// Snippet TypeScript tidak ditemukan.'),
        firstValueFrom(
          this.http.get(`snippets/snackbar/${dir}/${file}.html`, { responseType: 'text' }),
        ).catch(() => '<!-- Snippet HTML tidak ditemukan. -->'),
      ]);
      return { ts, html };
    } catch {
      return {
        ts: '// Gagal memuat snippet TypeScript.',
        html: '<!-- Gagal memuat snippet HTML. -->',
      };
    }
  }

  setTab(tab: 'html' | 'ts'): void {
    this.activeTab.set(tab);
  }

  toggleCode(): void {
    this.showCode.update((val) => !val);
  }

  setDuration(duration: number): void {
    this.selectedDuration.set(duration);
  }

  private addLog(message: string): void {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    this.logs.update((items) => [
      { time: timeStr, message },
      ...items.slice(0, 9), // Simpan 10 riwayat terakhir
    ]);
  }

  bukaSederhana(): void {
    this.addLog('Membuka snackbar sederhana (3000ms)...');
    this.bukaSnackbar('Operasi berhasil diselesaikan.', 3000);
  }

  bukaKustom(): void {
    const msg = this.customMessage().trim() || 'Pemberitahuan sistem WUI.';
    const dur = this.selectedDuration();
    const durLabel = dur > 0 ? `${dur}ms` : 'persistent (hanya tombol OK)';
    this.addLog(`Membuka snackbar kustom: "${msg}" (${durLabel})`);
    this.bukaSnackbar(msg, dur);
  }

  bukaAntrean(): void {
    this.addLog('Memicu pesan pertama: "Memproses unggahan berkas..."');
    this.bukaSnackbar('1/2 Memproses unggahan berkas...', 3000);

    // Buka pesan kedua setelah 700ms untuk mendemonstrasikan pergantian otomatis
    setTimeout(() => {
      this.addLog('Memicu pesan kedua: "Unggahan berkas selesai!" (menggantikan pesan 1)');
      this.bukaSnackbar('2/2 Unggahan berkas selesai!', 3000);
    }, 700);
  }

  private bukaSnackbar(message: string, duration: number): void {
    this.isActive.set(true);
    const ref = this.snackbarService.open(message, duration);
    this.currentRef = ref;

    ref.afterDismissed.subscribe(() => {
      if (this.currentRef === ref) {
        this.isActive.set(false);
        this.currentRef = undefined;
      }
      this.addLog(`Snackbar ditutup (afterDismissed dipicu).`);
    });
  }

  tutupManual(): void {
    if (!this.isActive()) {
      return;
    }
    this.addLog('Tombol tutup manual diklik via snackbarService.close()');
    this.snackbarService.close();
  }
}