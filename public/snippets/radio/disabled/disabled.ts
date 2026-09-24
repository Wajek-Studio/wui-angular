import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WuiRadioButton, WuiRadioGroup } from '@wajek/wui';

@Component({
  selector: 'demo-radio-disabled',
  imports: [FormsModule, WuiRadioGroup, WuiRadioButton],
  templateUrl: './disabled.html'
})
export class RadioDisabledDemoComponent {
  selectedStatus = 'arsip';
  isDisabled = true;
}
