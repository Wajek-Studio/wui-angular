import {
  CdkContextMenuTrigger,
  CdkMenu,
  CdkMenuItem,
} from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { WuiButton, WuiDialogService, WuiPage, WuiPageService } from '@wajek/wui';

import { activeDesc, rect } from '../select-spike/spike-ukur';
import { SpikeBlok } from './spike-blok';

/**
 * Harness **F0** untuk rencana `wui-context-menu-plan.md` — kode sekali pakai, bukan bagian library.
 *
 * Menunya memakai directive CDK **apa adanya** (`[cdkContextMenuTriggerFor]` + `cdkMenu` +
 * `cdkMenuItem`), tanpa pembungkus `wui-*`, supaya yang diukur benar-benar perilaku CDK — bukan
 * perilaku pembungkus yang belum ada. Strategi gulir ditimpa jadi `block()` (keputusan N5, disetujui
 * user 23 Sep 2026) supaya pertanyaan "halaman terkunci atau tidak" bisa dijawab di sini.
 *
 * Log pengukuran ditulis ke `#jejak`; angka geometri dibaca dari luar (Playwright) supaya tidak
 * bergantung pada tick layout di dalam komponen.
 */
@Component({
  selector: 'app-context-menu-spike',
  imports: [WuiButton, WuiPage, CdkMenu, CdkMenuItem, CdkContextMenuTrigger, SpikeBlok],
  templateUrl: './context-menu-spike.page.html',
  styleUrl: './context-menu-spike.page.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuSpikePage {
  private readonly halaman = inject(WuiPageService);
  private readonly dialogs = inject(WuiDialogService);

  private readonly tplHalaman = viewChild.required<TemplateRef<unknown>>('halaman');
  private readonly tplDialog = viewChild.required<TemplateRef<unknown>>('dialog');

  protected readonly jejak = signal<string[]>([]);
  protected readonly jejakTeks = computed(() => this.jejak().join('\n') || '(belum ada kejadian)');

  /** Berapa kali item menu diaktifkan (Enter/Space/klik) — pembuktian `(cdkMenuItemTriggered)`. */
  protected readonly dipicu = signal(0);

  /** Berapa kali tombol di **belakang** panel menerima klik (panel tanpa backdrop). */
  protected readonly hitungBelakang = signal(0);

  /** Item yang bisa diubah selagi menu terbuka (dipicu dari luar lewat `window.spikeTambah()`). */
  protected readonly daftarDinamis = signal<string[]>(['Satu', 'Dua', 'Tiga']);

  /** 40 item untuk menguji gulir di dalam panel selagi halaman diblok. */
  protected readonly panjang = Array.from({ length: 40 }, (_, i) => `Baris ${i + 1}`);

  /** Titik klik kanan terakhir. */
  protected readonly titik = signal('—');

  constructor() {
    afterNextRender(() => {
      this.halaman.replace(this.tplHalaman(), { variant: 'full' });

      // Kait dari luar: mengubah daftar item **selagi menu terbuka**. Tombol di halaman tidak bisa
      // dipakai untuk ini — mengkliknya adalah klik di luar panel, jadi menunya keburu tertutup.
      const g = globalThis as unknown as { spikeTambah?: () => void; spikeHapus?: () => void };
      g.spikeTambah = () =>
        this.daftarDinamis.update((daftar) => [...daftar, `Baru ${daftar.length + 1}`]);
      g.spikeHapus = () =>
        this.daftarDinamis.update((daftar) => daftar.slice(0, Math.max(0, daftar.length - 1)));

      this.catat(`[env] jendela ${window.innerWidth}×${window.innerHeight}`);
    });
  }

  protected catat(baris: string): void {
    this.jejak.update((baris2) => [...baris2, baris]);
  }

  protected bersihkan(): void {
    this.jejak.set([]);
  }

  /** Klik kanan pada pemicu: simpan titiknya sebelum CDK membuka menu. */
  protected catatTitik(ev: MouseEvent): void {
    this.titik.set(`${ev.clientX},${ev.clientY}`);
  }

  protected saatBuka(nama: string): void {
    this.catat(`[${nama}] BUKA · titik ${this.titik()} · fokus ${activeDesc()}`);
    // Fokus dipasang CDK secara sinkron; baris kedua membuktikan ia tidak direbut kembali setelah
    // layout/trap/interupsi lain berjalan.
    requestAnimationFrame(() =>
      this.catat(`[${nama}] +frame · fokus ${activeDesc()}`),
    );
  }

  protected saatTutup(nama: string): void {
    this.catat(`[${nama}] TUTUP · fokus ${activeDesc()} · dipicu ${this.dipicu()}`);
  }

  protected aktifkan(label: string): void {
    this.dipicu.update((n) => n + 1);
    this.catat(`[aksi] item "${label}" diaktifkan (#${this.dipicu()})`);
  }

  protected klikBelakang(): void {
    this.hitungBelakang.update((n) => n + 1);
    this.catat(`[belakang] tombol di belakang panel menerima klik (#${this.hitungBelakang()})`);
  }

  /** Buka paksa di sudut kanan-bawah jendela — uji flip/push (bukan klik kanan). */
  protected bukaDiTepi(trigger: CdkContextMenuTrigger): void {
    this.titik.set(`${window.innerWidth - 6},${window.innerHeight - 6}`);
    trigger.open({ x: window.innerWidth - 6, y: window.innerHeight - 6 });
    this.catat('[tepi] open() dipanggil di sudut kanan-bawah');
  }

  protected bukaDialog(): void {
    this.dialogs.openTemplate(this.tplDialog(), {});
    this.catat('[dialog] dibuka');
  }

  /** Dipakai tombol "Ukur" di halaman untuk mencatat geometri panel relatif titik klik kanan. */
  protected ukur(nama: string, idPanel: string): void {
    const panel = document.getElementById(idPanel);

    if (!panel) {
      this.catat(`[${nama}] panel #${idPanel} tidak ada (menu tertutup?)`);
      return;
    }

    const kotak = panel.getBoundingClientRect();
    const [x, y] = this.titik().split(',').map(Number);

    this.catat(
      `[${nama}] panel ${rect(panel)} · titik ${this.titik()} · ` +
        `offset kiri=${Number.isNaN(x) ? '—' : Math.round(kotak.left - x)} ` +
        `atas=${Number.isNaN(y) ? '—' : Math.round(kotak.top - y)}`,
    );
  }
}
