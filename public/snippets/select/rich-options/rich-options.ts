import { Component, signal } from '@angular/core';
import {
  WuiFormField,
  WuiIcon,
  WuiInput,
  WuiLabel,
  WuiOption,
  WuiSelect,
} from '@wajek/wui';

@Component({
  selector: 'app-select-rich-options-demo',
  imports: [WuiFormField, WuiIcon, WuiInput, WuiLabel, WuiOption, WuiSelect],
  templateUrl: './rich-options.html',
})
export class SelectRichOptionsDemoComponent {
  readonly kotaKaya = signal<string | null>(null);
}
