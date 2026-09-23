import { Component, signal } from '@angular/core';
import {
  WuiFormField,
  WuiInput,
  WuiLabel,
  WuiOption,
  WuiSelect,
} from '@wajek/wui';

@Component({
  selector: 'app-select-filled-demo',
  imports: [WuiFormField, WuiInput, WuiLabel, WuiOption, WuiSelect],
  templateUrl: './filled.html',
})
export class SelectFilledDemoComponent {
  readonly kota = signal<string | null>(null);
  readonly negara = signal<string>('Indonesia');
}
