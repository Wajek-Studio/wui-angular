import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WuiRadioButton, WuiRadioGroup } from '@wajek/wui';

@Component({
  selector: 'demo-radio-rich-label',
  imports: [FormsModule, WuiRadioGroup, WuiRadioButton],
  templateUrl: './rich-label.html'
})
export class RadioRichLabelDemoComponent {
  plan = 'pro';
}
