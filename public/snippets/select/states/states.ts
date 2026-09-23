import { Component, signal } from '@angular/core';
import {
  WuiFormField,
  WuiInput,
  WuiLabel,
  WuiOption,
  WuiSelect,
} from '@wajek/wui';

@Component({
  selector: 'app-select-states-demo',
  imports: [WuiFormField, WuiInput, WuiLabel, WuiOption, WuiSelect],
  templateUrl: './states.html',
})
export class SelectStatesDemoComponent {
  readonly kota = signal<string | null>(null);
}
