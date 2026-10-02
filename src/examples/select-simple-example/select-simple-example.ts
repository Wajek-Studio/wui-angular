import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { WuiButton, WuiFormField, WuiInput, WuiOption, WuiSelect, WuiLabel, WuiHint } from "@wajek/wui";

interface Negara {
  value: string;
  label: string;
}

interface Kota {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
    selector: 'select-simple-example',
    templateUrl: './select-simple-example.html',
    imports: [WuiFormField, WuiInput, WuiOption, WuiButton, WuiSelect, WuiLabel, FormsModule, WuiHint]
})
export class SelectSimpleExample {

    protected readonly dataNegara = signal<Negara[]>([
        { value: 'indonesia', label: 'Indonesia' },
        { value: 'malaysia', label: 'Malaysia' },
        { value: 'singapura', label: 'Singapura' },
    ]);

    selectedNegara = signal<string | null>('indonesia');

    protected readonly dataKota = signal<Kota[]>([
        { value: 'aceh', label: 'Banda Aceh' },
        { value: 'medan', label: 'Medan' },
        { value: 'padang', label: 'Padang' },
        { value: 'pekanbaru', label: 'Pekanbaru' },
        { value: 'batam', label: 'Batam' },
        { value: 'palembang', label: 'Palembang' },
        { value: 'lampung', label: 'Bandar Lampung' },
        { value: 'jakarta', label: 'Jakarta' },
        { value: 'bogor', label: 'Bogor' },
        { value: 'tangerang', label: 'Tangerang' },
        { value: 'bekasi', label: 'Bekasi' },
        { value: 'bandung', label: 'Bandung' },
        { value: 'cirebon', label: 'Cirebon' },
        { value: 'semarang', label: 'Semarang' },
        { value: 'solo', label: 'Surakarta (Solo)' },
        { value: 'yogya', label: 'Yogyakarta' },
        { value: 'surabaya', label: 'Surabaya' },
        { value: 'malang', label: 'Malang' },
        { value: 'denpasar', label: 'Denpasar' },
        { value: 'makassar', label: 'Makassar' },
    ]);

  selectedKota = signal<string | null>(null);

  pilih(value: string) {
    this.selectedKota.set(value);
  }

  reset() {
    this.selectedKota.set(null);
  }
    
}