import { Component, signal } from '@angular/core';
import {
  WuiButton,
  WuiFormField,
  WuiInput,
  WuiLabel,
  WuiOption,
  WuiSelect,
} from '@wajek/wui';

@Component({
  selector: 'app-select-outlined-demo',
  imports: [WuiButton, WuiFormField, WuiInput, WuiLabel, WuiOption, WuiSelect],
  templateUrl: './outlined.html',
})
export class SelectOutlinedDemoComponent {
  readonly kota = signal<string | null>(null);
  readonly negara = signal<string>('Indonesia');

  isi(): void {
    this.kota.set('Bandung');
  }

  kosongkan(): void {
    this.kota.set('');
  }
}
