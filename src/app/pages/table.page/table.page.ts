import { Component, OnInit, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WuiButton, WuiIcon, WuiPage, WuiPageService, WuiTable, WuiTableResponsive } from '@wajek/wui';

export interface SampleUser {
  id: number;
  name: string;
  group: string;
  amount: number;
  status: 'Aktif' | 'Tertunda' | 'Selesai';
}

@Component({
  selector: 'app-table.page',
  imports: [RouterLink, DecimalPipe, WuiPage, WuiTable, WuiTableResponsive, WuiButton, WuiIcon],
  templateUrl: './table.page.html',
  styleUrl: './table.page.scss',
})
export class TablePage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);
  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  // Kontrol playground interaktif
  readonly isHover = signal(true);
  readonly isDense = signal(false);

  readonly sampleData: SampleUser[] = [
    { id: 1, name: 'Moch. Rizal Rachmadani', group: 'Investor', amount: 500000, status: 'Aktif' },
    { id: 2, name: 'Selvi Murniati', group: 'Investor', amount: 500000, status: 'Aktif' },
    { id: 3, name: 'Ahmad Fauzi', group: 'Mitra Usaha', amount: 750000, status: 'Selesai' },
    { id: 4, name: 'Dewi Sartika', group: 'Pengembang', amount: 1250000, status: 'Tertunda' },
    { id: 5, name: 'Budi Handoko', group: 'Mitra Usaha', amount: 350000, status: 'Aktif' },
  ];

  get totalAmount(): number {
    return this.sampleData.reduce((sum, item) => sum + item.amount, 0);
  }

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }

  toggleHover(): void {
    this.isHover.update((v) => !v);
  }

  toggleDense(): void {
    this.isDense.update((v) => !v);
  }
}
