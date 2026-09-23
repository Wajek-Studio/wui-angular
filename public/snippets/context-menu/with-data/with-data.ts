import { Component, signal } from '@angular/core';
import {
  WuiContextMenuTrigger,
  WuiIcon,
  WuiMenu,
  WuiMenuDivider,
  WuiMenuItem,
  WuiTable,
  WuiTableResponsive,
} from '@wajek/wui';

export interface BarisData {
  id: number;
  nama: string;
}

@Component({
  selector: 'app-context-menu-data-demo',
  imports: [
    WuiContextMenuTrigger,
    WuiIcon,
    WuiMenu,
    WuiMenuDivider,
    WuiMenuItem,
    WuiTable,
    WuiTableResponsive,
  ],
  templateUrl: './with-data.html',
})
export class ContextMenuDataDemoComponent {
  readonly baris = signal<BarisData[]>([
    { id: 1, nama: 'Berkas A' },
    { id: 2, nama: 'Berkas B' },
    { id: 3, nama: 'Berkas C' },
  ]);

  readonly aksiTerakhir = signal('(belum ada aksi)');

  aksi(nama: string, data?: BarisData): void {
    this.aksiTerakhir.set(data ? `${nama} · ${data.nama}` : nama);
  }
}
