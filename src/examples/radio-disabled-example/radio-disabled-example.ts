import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WuiRadioButton, WuiRadioGroup } from '@wajek/wui';

@Component({
  selector: 'radio-disabled-example',
  standalone: true,
  imports: [FormsModule, WuiRadioGroup, WuiRadioButton],
  templateUrl: './radio-disabled-example.html'
})
export class RadioDisabledExample {
  readonly selectedStatus = signal('arsip');
}
