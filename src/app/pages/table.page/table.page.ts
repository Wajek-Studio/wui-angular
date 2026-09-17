import { Component, OnInit, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  WuiBadge,
  WuiButton,
  WuiIcon,
  WuiLoading,
  WuiPage,
  WuiPageService,
  WuiPagination,
  WuiTable,
  WuiTableResponsive,
} from '@wajek/wui';

export interface SampleUser {
  id: number;
  name: string;
  group: string;
  amount: number;
  status: 'Aktif' | 'Tertunda' | 'Selesai';
}

@Component({
  selector: 'app-table.page',
  imports: [
    RouterLink,
    DecimalPipe,
    WuiPage,
    WuiTable,
    WuiTableResponsive,
    WuiButton,
    WuiIcon,
    WuiPagination,
    WuiLoading,
    WuiBadge,
  ],
  templateUrl: './table.page.html',
  styleUrl: './table.page.scss',
})
export class TablePage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);
  readonly pageTpl = viewChild<TemplateRef<unknown>>('pageTpl');

  // Kontrol playground interaktif tabel
  readonly isHover = signal(true);
  readonly isDense = signal(false);
  readonly isAlternate = signal(false);

  // State API seperti pada peserta (ujian-yasmin)
  readonly data = signal<SampleUser[]>([]);
  readonly count = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  // Parameter pagination
  readonly page = signal<number>(1);
  readonly limit = signal<number>(5);

  // Database mock di sisi server
  readonly sampleData: SampleUser[] = [
    { id: 1, name: 'Moch. Rizal Rachmadani', group: 'Investor', amount: 500000, status: 'Aktif' },
    { id: 2, name: 'Selvi Murniati', group: 'Investor', amount: 500000, status: 'Aktif' },
    { id: 3, name: 'Ahmad Fauzi', group: 'Mitra Usaha', amount: 750000, status: 'Selesai' },
    { id: 4, name: 'Dewi Sartika', group: 'Pengembang', amount: 1250000, status: 'Tertunda' },
    { id: 5, name: 'Budi Handoko', group: 'Mitra Usaha', amount: 350000, status: 'Aktif' },
    { id: 6, name: 'Siti Aminah', group: 'Pengembang', amount: 920000, status: 'Aktif' },
    { id: 7, name: 'Hendra Gunawan', group: 'Investor', amount: 1800000, status: 'Selesai' },
    { id: 8, name: 'Rina Wijaya', group: 'Mitra Usaha', amount: 450000, status: 'Aktif' },
    { id: 9, name: 'Doni Pratama', group: 'Pengembang', amount: 650000, status: 'Tertunda' },
    { id: 10, name: 'Lestari Indah', group: 'Investor', amount: 2100000, status: 'Aktif' },
    { id: 11, name: 'Farhan Kurniawan', group: 'Mitra Usaha', amount: 800000, status: 'Selesai' },
    { id: 12, name: 'Nurul Hidayah', group: 'Pengembang', amount: 1100000, status: 'Aktif' },
    { id: 13, name: 'Agus Setiawan', group: 'Investor', amount: 1500000, status: 'Aktif' },
    { id: 14, name: 'Maya Anggraini', group: 'Mitra Usaha', amount: 400000, status: 'Tertunda' },
    { id: 15, name: 'Tri Wahyudi', group: 'Pengembang', amount: 875000, status: 'Selesai' },
    { id: 16, name: 'Putri Ramadhani', group: 'Investor', amount: 3000000, status: 'Aktif' },
  ];

  get totalAmount(): number {
    return this.sampleData.reduce((sum, item) => sum + item.amount, 0);
  }

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
    this.refreshData();
  }

  /**
   * Simulasi pemanggilan API backend seperti pada service peserta:
   * GET /api/peserta?page=...&limit=...
   * Response: { data: SampleUser[], count: number }
   */
  async refreshData(): Promise<void> {
    this.isLoading.set(true);

    // Latency simulasi jaringan / backend 350ms
    await new Promise((resolve) => setTimeout(resolve, 350));

    const offset = (this.page() - 1) * this.limit();
    const resultSlice = this.sampleData.slice(offset, offset + this.limit());

    this.data.set(resultSlice);
    this.count.set(this.sampleData.length);
    this.isLoading.set(false);
  }

  toggleHover(): void {
    this.isHover.update((v) => !v);
  }

  toggleDense(): void {
    this.isDense.update((v) => !v);
  }

  toggleAlternate(): void {
    this.isAlternate.update((v) => !v);
  }
}
