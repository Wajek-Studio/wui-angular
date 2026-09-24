import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WuiRadioButton, WuiRadioGroup } from '@wajek/wui';

@Component({
  selector: 'demo-radio-vertical',
  imports: [FormsModule, WuiRadioGroup, WuiRadioButton],
  templateUrl: './vertical.html'
})
export class RadioVerticalDemoComponent {
  shippingMethod = 'reguler';
}
