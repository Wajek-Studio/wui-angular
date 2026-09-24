import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WuiRadioButton, WuiRadioGroup } from '@wajek/wui';

@Component({
  selector: 'demo-radio-basic',
  imports: [FormsModule, WuiRadioGroup, WuiRadioButton],
  templateUrl: './basic.html'
})
export class RadioBasicDemoComponent {
  selectedColor = 'merah';
}
